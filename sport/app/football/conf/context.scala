package conf

import app.LifecycleComponent
import common._
import feed.Competitions
import model.{TeamMap, LiveBlogAgent}
import pa.{PaClientErrorsException, Http, PaClient}
import play.api.inject.ApplicationLifecycle
import play.api.libs.ws.WS
import scala.concurrent.{ExecutionContext, Future}

class FootballLifecycle(
  appLifeCycle: ApplicationLifecycle,
  jobs: JobScheduler,
  akkaAsync: AkkaAsync)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifeCycle.addStopHook { () => Future {
    descheduleJobs()
  }}

  private def scheduleJobs() {
    Competitions.competitionIds.zipWithIndex foreach { case (id, index) =>
      //stagger fixtures and results refreshes to avoid timeouts
      val seconds = index * 5 % 60
      val minutes = index * 5 / 60 % 5
      val cron = s"$seconds $minutes/5 * * * ?"

      jobs.schedule(s"CompetitionAgentRefreshJob_$id", cron) {
        Competitions.refreshCompetitionAgent(id)
      }
    }

    jobs.schedule("MatchDayAgentRefreshJob", "0 0/5 * * * ?") {
      Competitions.refreshMatchDay()
    }

    jobs.schedule("CompetitionRefreshJob", "0 0/10 * * * ?") {
      Competitions.refreshCompetitionData()
    }

    jobs.schedule("LiveBlogRefreshJob", "0 0/2 * * * ?") {
      LiveBlogAgent.refresh()
    }

    jobs.schedule("TeamMapRefreshJob", "0 0/10 * * * ?") {
      TeamMap.refresh()
    }
  }

  private def descheduleJobs() {
    Competitions.competitionIds foreach { id =>
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
      val competitionUpdate = Competitions.refreshCompetitionData()
      competitionUpdate.onSuccess { case _ => Competitions.competitionIds.foreach(Competitions.refreshCompetitionAgent) }
      Competitions.refreshMatchDay()
      LiveBlogAgent.refresh()
      TeamMap.refresh()
    }
  }
}

object FootballClient extends PaClient with Http with Logging with ExecutionContexts {

  import play.api.Play.current

  private var _http: Http = new Http {
    override def GET(urlString: String): Future[pa.Response] = {

        val promiseOfResponse = WS.url(urlString).withRequestTimeout(2000).get()

        promiseOfResponse.map{ r =>

          //this feed has a funny character at the start of it http://en.wikipedia.org/wiki/Zero-width_non-breaking_space
          //I have reported to PA, but just trimming here so we can carry on development
          pa.Response(r.status, r.body.dropWhile(_ != '<'), r.statusText)
        }
      }
  }

  def http = _http
  def http_=(delegateHttp: Http) = _http = delegateHttp

  lazy val apiKey = SportConfiguration.pa.footballKey

  override def GET(urlString: String): Future[pa.Response] = {
    _http.GET(urlString)
  }

  def logErrors[T]: PartialFunction[Throwable, T] = {
    case e: PaClientErrorsException =>
      log.error(s"Football Client errors: ${e.getMessage}")
      throw e
  }

}



