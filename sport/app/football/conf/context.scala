package conf

import app.LifecycleComponent
import common._
import contentapi.ContentApiClient
import feed.CompetitionsService
import model.{Competition, TeamMap}
import pa.{Http, PaClient, PaClientErrorsException}
import play.api.inject.ApplicationLifecycle
import play.api.libs.ws.WSClient
import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}
import java.time.Clock

class FootballLifecycle(
    appLifeCycle: ApplicationLifecycle,
    jobs: JobScheduler,
    akkaAsync: AkkaAsync,
    competitionsService: CompetitionsService,
    contentApiClient: ContentApiClient,
)(implicit ec: ExecutionContext)
    extends LifecycleComponent
    with GuLogging {

  val defaultClock = Clock.systemDefaultZone()

  appLifeCycle.addStopHook { () =>
    Future {
      descheduleJobs()
      monixJobs.stop // stop the observable
    }
  }

  private def scheduleJobs() {
    competitionsService.competitionIds.zipWithIndex foreach {
      case (id, index) =>
        //stagger fixtures and results refreshes to avoid timeouts
        val seconds = index * 5 % 60
        val minutes = index * 5 / 60 % 5
        val cron = s"$seconds $minutes/5 * * * ?"

        jobs.schedule(s"CompetitionAgentRefreshJob_$id", cron) {
          competitionsService.refreshCompetitionAgent(id, defaultClock)
        }
    }

    jobs.schedule("MatchDayAgentRefreshJob", "0 0/5 * * * ?") {
      competitionsService.refreshMatchDay(defaultClock)
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

  object monixJobs {

    // ********* Monix implementation *********
    import monix.eval.Task
    import monix.execution.Scheduler
    import monix.reactive.Observable
    import monix.execution.ExecutionModel.AlwaysAsyncExecution
    import monix.reactive.{Consumer}

    // We need a schedular in scope
    lazy implicit val scheduler = Scheduler(scala.concurrent.ExecutionContext.Implicits.global, AlwaysAsyncExecution)

    // Maybe handle error like this?
    def retryWithDelay[A](source: Observable[A], delay: FiniteDuration): Observable[A] =
      source.onErrorHandleWith { _ =>
        retryWithDelay(source, delay).delayExecution(delay)
      }

    import scala.collection.immutable

    val observableInterval = 10.second
    val stream = {
      Observable
        .intervalAtFixedRate(observableInterval)
        .mapEval(_ => {
          Task.defer {
            val task = Task.fromFuture(competitionsService.refreshMatchDay(defaultClock)).timeout(observableInterval)
            task.onErrorHandle { error =>
              {
                log.error(s"Refreshing match day data failed due to ${error.getMessage}")
                immutable.Iterable[Competition]()
              }
            }
          }
        })
        .onErrorRestartUnlimited // in case there was any error in any operator in observable, we don't want to stop the observable
        .consumeWith(Consumer.complete) // Here the observable is converted to a task
    }

    lazy val start = stream.runToFuture(monixJobs.scheduler)
    def stop = start.cancel()

    // ********* end of Monix implementation *********

  }

  override def start(): Unit = {
    monixJobs.start

    descheduleJobs()
    scheduleJobs()

    akkaAsync.after1s {
      val competitionUpdate = competitionsService.refreshCompetitionData()
      competitionUpdate.foreach { _ =>
        competitionsService.competitionIds.foreach(id => competitionsService.refreshCompetitionAgent(id, defaultClock))
      }
      competitionsService.refreshMatchDay(defaultClock)
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
      //this feed has a funny character at the start of it http://en.wikipedia.org/wiki/Zero-width_non-breaking_space
      //I have reported to PA, but just trimming here so we can carry on development
      pa.Response(r.status, r.body.dropWhile(_ != '<'), r.statusText)
    }
  }

  lazy val apiKey = SportConfiguration.pa.footballKey

  def logErrorsWithMessage[T](message: String): PartialFunction[Throwable, T] = {
    case e: PaClientErrorsException =>
      log.error(s"Football Client errors: $message (${e.getMessage})")
      throw e
  }

}
