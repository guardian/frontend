package conf

import app.LifecycleComponent
import common._
import contentapi.ContentApiClient
import feed.CompetitionsService
import model.{ApplicationContext, TeamMap}
import pa.{Http, PaClient, PaClientErrorsException}
import play.api.inject.ApplicationLifecycle
import play.api.libs.ws.WSClient
import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}
import java.time.Clock

class FootballLifecycle(
    appLifeCycle: ApplicationLifecycle,
    jobs: JobScheduler,
    pekkoAsync: PekkoAsync,
    competitionsService: CompetitionsService,
    contentApiClient: ContentApiClient,
)(implicit ec: ExecutionContext, context: ApplicationContext)
    extends LifecycleComponent {

  val defaultClock = Clock.systemDefaultZone()

  appLifeCycle.addStopHook { () =>
    Future {
      descheduleJobs()
    }
  }

  private def scheduleJobs(): Unit = {
    competitionsService.competitionIds.zipWithIndex foreach { case (id, index) =>
      val cron = if (context.isPreview) {
        // In preview mode, the jobs will run once every hour
        // the jobs are spaced out by 1 minute from each other
        // e.g. competition index 0, runs every hour at minute 0
        // competition index 4, runs every hour at minute 5
        val minute = index % 60 // Distribute jobs over the 60 minutes of the hour
        s"0 $minute * * * ?"
      } else {
        // Jobs will run once every 5 minute at $seconds seconds past the minute
        // starting at $minutes minutes past the hour
        // The jobs are spaced out by 5 seconds from each other
        // e.g. competition index 0, runs every 5 minutes at second 0
        // competition index 4, runs every 5 minutes at second 20 past the minute
        val seconds = index * 5 % 60
        val minutes = index * 5 / 60 % 5
        s"$seconds $minutes/5 * * * ?"
      }

      jobs.schedule(s"CompetitionAgentRefreshJob_$id", cron) {
        competitionsService.refreshCompetitionAgent(id, defaultClock)
      }
    }

    /*
    This is a legacy job. It will possibly duplicate the MaybeMatchDayAgentRefreshJob once every 5 minutes IF a match is in progress.
    Ideally, we should combine the logic of these two jobs so we only call once. This is tricky to achieve with the current code.
    We intend to move to a stream model so we can achieve this.
     */
    // if preview "Every hour at 40 minutes" otherwise "Every 5 minutes"
    // 40 minute was chosen for preview to run these jobs after the 35 CompetitionAgentRefreshJobs are finished
    jobs.schedule("MatchDayAgentRefreshJob", if (context.isPreview) "0 40 * * * ?" else "0 0/5 * * * ?") {
      competitionsService.refreshMatchDay(defaultClock)
    }

    // if preview "Every hour at 40 minutes" otherwise "Every minute"
    jobs.schedule("MaybeMatchDayAgentRefreshJob", if (context.isPreview) "0 40 * * * ?" else "0 0/1 * * * ?") {
      competitionsService.maybeRefreshLiveMatches(defaultClock)
    }

    // if preview "Every hour at 40 minutes" otherwise "Every 10 minutes"
    jobs.schedule("CompetitionRefreshJob", if (context.isPreview) "0 40 * * * ?" else "0 0/10 * * * ?") {
      competitionsService.refreshCompetitionData()
    }

    // if preview "Every hour at 40 minutes" otherwise "Every 10 minutes"
    jobs.schedule("TeamMapRefreshJob", if (context.isPreview) "0 40 * * * ?" else "0 0/10 * * * ?") {
      TeamMap.refresh()(contentApiClient, ec)
    }
  }

  private def descheduleJobs(): Unit = {
    competitionsService.competitionIds foreach { id =>
      jobs.deschedule(s"CompetitionAgentRefreshJob_$id")
    }
    jobs.deschedule("MatchDayAgentRefreshJob")
    jobs.deschedule("MaybeMatchDayAgentRefreshJob")
    jobs.deschedule("CompetitionRefreshJob")
    jobs.deschedule("LiveBlogRefreshJob")
    jobs.deschedule("TeamMapRefreshJob")
  }

  override def start(): Unit = {
    descheduleJobs()
    scheduleJobs()

    pekkoAsync.after1s {
      val competitionUpdate = competitionsService.refreshCompetitionData()
      competitionUpdate.foreach { _ =>
        competitionsService.competitionIds.foreach(id => competitionsService.refreshCompetitionAgent(id, defaultClock))
      }
      competitionsService.refreshMatchDay(defaultClock)
      competitionsService.maybeRefreshLiveMatches(defaultClock)
      TeamMap.refresh()(contentApiClient, ec)
    }
  }
}

class FootballClient(wsClient: WSClient)(implicit executionContext: ExecutionContext)
    extends PaClient
    with Http
    with GuLogging {

  // Runs the API calls via a CDN
  override lazy val base: String = "https://football-api.guardianapis.com/v1.5"

  override def GET(urlString: String): Future[pa.Response] = {

    val promiseOfResponse = wsClient.url(urlString).withRequestTimeout(2.second).get()

    promiseOfResponse.map { r =>
      // this feed has a funny character at the start of it http://en.wikipedia.org/wiki/Zero-width_non-breaking_space
      // I have reported to PA, but just trimming here so we can carry on development
      pa.Response(r.status, r.body.dropWhile(_ != '<'), r.statusText)
    }
  }

  lazy val apiKey = SportConfiguration.pa.footballKey

  def logErrorsWithMessage[T](message: String): PartialFunction[Throwable, T] = { case e: PaClientErrorsException =>
    log.error(s"Football Client errors: $message (${e.getMessage})")
    throw e
  }

}
