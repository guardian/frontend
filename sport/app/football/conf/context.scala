package conf

import app.LifecycleComponent
import common._
import contentapi.ContentApiClient
import feed.CompetitionsService
import model.TeamMap
import pa.{Http, PaClient, PaClientErrorsException}
import play.api.inject.ApplicationLifecycle
import play.api.libs.ws.WSClient
import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

class FootballLifecycle(
  appLifeCycle: ApplicationLifecycle,
  jobs: JobScheduler,
  akkaAsync: AkkaAsync,
  competitionsService: CompetitionsService,
  contentApiClient: ContentApiClient)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifeCycle.addStopHook { () => Future {
    descheduleJobs()
  }}

  private def scheduleJobs() {
    competitionsService.competitionIds.zipWithIndex foreach { case (id, index) =>
      //stagger fixtures and results refreshes to avoid timeouts
      val seconds = index * 5 % 60
      val minutes = index * 5 / 60 % 5
      val cron = s"$seconds $minutes/5 * * * ?"

      jobs.schedule(s"CompetitionAgentRefreshJob_$id", cron) {
        competitionsService.refreshCompetitionAgent(id)
      }
    }

    jobs.schedule("MatchDayAgentRefreshJob", "0 0/5 * * * ?") {
      competitionsService.refreshMatchDay()
    }

    jobs.schedule("CompetitionRefreshJob", "0 0/10 * * * ?") {
      competitionsService.refreshCompetitionData()
    }

    jobs.schedule("TeamMapRefreshJob", "0 0/10 * * * ?") {
      TeamMap.refresh()(contentApiClient, ec)
    }
  }

  private def descheduleJobs() {
    competitionsService.competitionIds foreach { id =>
      jobs.deschedule(s"CompetitionAgentRefreshJob_$id")
    }
    jobs.deschedule("MatchDayAgentRefreshJob")
    jobs.deschedule("CompetitionRefreshJob")
    jobs.deschedule("LiveBlogRefreshJob")
    jobs.deschedule("TeamMapRefreshJob")
  }

  override def start(): Unit = {
    descheduleJobs()
    scheduleJobs()

    akkaAsync.after1s {
      val competitionUpdate = competitionsService.refreshCompetitionData()
      competitionUpdate.onSuccess { case _ => competitionsService.competitionIds.foreach(competitionsService.refreshCompetitionAgent) }
      competitionsService.refreshMatchDay()
      TeamMap.refresh()(contentApiClient, ec)
    }
  }
}

class FootballClient(wsClient: WSClient)(implicit executionContext: ExecutionContext) extends PaClient with Http with Logging {

  // Runs the API calls via a CDN
  override lazy val base: String = "http://football-api.gu-web.net/v1.5"

  override def GET(urlString: String): Future[pa.Response] = {

    val promiseOfResponse = wsClient.url(urlString).withRequestTimeout(2.second).get()

    promiseOfResponse.map { r =>

      //this feed has a funny character at the start of it http://en.wikipedia.org/wiki/Zero-width_non-breaking_space
      //I have reported to PA, but just trimming here so we can carry on development
      pa.Response(r.status, r.body.dropWhile(_ != '<'), r.statusText)
    }
  }

  lazy val apiKey = SportConfiguration.pa.footballKey

  def logErrors[T]: PartialFunction[Throwable, T] = {
    case e: PaClientErrorsException =>
      log.error(s"Football Client errors: ${e.getMessage}")
      throw e
  }

}



