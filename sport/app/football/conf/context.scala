package conf

import common.PaMetrics._
import common._
import com.gu.management.{ PropertiesPage, StatusPage, ManifestPage }
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage
import feed.Competitions
import model.{TeamMap, LiveBlogAgent}
import pa.{Http, PaClient}
import play.api.{Application => PlayApp, Plugin}
import play.api.libs.ws.WS
import scala.concurrent.Future
import scala.concurrent.duration._

class FootballStatsPlugin(app: PlayApp) extends Plugin {

  def scheduleJobs() {
    Competitions.competitionIds.zipWithIndex map { case (id, index) =>
      //stagger fixtures and results refreshes to avoid timeouts
      val seconds = index * 5 % 60
      val minutes = index * 5 / 60 % 5
      val cron = s"$seconds $minutes/5 * * * ?"

      Jobs.schedule(s"CompetitionAgentRefreshJob_$id", cron) {
        Competitions.refreshCompetitionAgent(id)
      }
    }

    Jobs.schedule("MatchDayAgentRefreshJob", "0/5 * * * * ?") {
      Competitions.refreshMatchDay()
    }

    Jobs.schedule("CompetitionRefreshJob", "0 0/10 * * * ?") {
      Competitions.refreshCompetitionData()
    }

    Jobs.schedule("LiveBlogRefreshJob", "0 0/2 * * * ?") {
      LiveBlogAgent.refresh()
    }

    Jobs.schedule("TeamMapRefreshJob", "0 0/10 * * * ?") {
      TeamMap.refresh()
    }

    // Have all these run once at load, then on the scheduled times
    AkkaAsync.after(5.seconds){
      Competitions.refreshCompetitionData()
      Competitions.refreshMatchDay()
      LiveBlogAgent.refresh()
      Competitions.competitionIds.foreach(Competitions.refreshCompetitionAgent)
      TeamMap.refresh()
    }
  }

  def descheduleJobs() {
    Competitions.competitionIds map { id =>
      Jobs.deschedule(s"CompetitionAgentRefreshJob_$id")
    }
    Jobs.deschedule("MatchDayAgentRefreshJob")
    Jobs.deschedule("CompetitionRefreshJob")
    Jobs.deschedule("LiveBlogRefreshJob")
    Jobs.deschedule("TeamMapRefreshJob")
  }

  override def onStart() {
    descheduleJobs()
    scheduleJobs()
  }

  override def onStop() {
    descheduleJobs()

    Competitions.stop()
    LiveBlogAgent.stop()
    TeamMap.stop()
  }
}

object FootballClient extends PaClient with Http with Logging with ExecutionContexts {

  override lazy val base = Configuration.pa.host

  private var _http: Http = new Http {
    override def GET(urlString: String): Future[pa.Response] = {
        val start = System.currentTimeMillis()
        val promiseOfResponse = WS.url(urlString).withRequestTimeout(2000).get()
        promiseOfResponse.onComplete( r => PaApiHttpTimingMetric.recordTimeSpent(System.currentTimeMillis() - start))

        promiseOfResponse.map{ r =>

          r.status match {
            case 200 => PaApiHttpOkMetric.recordCount(1)
            case _ => PaApiHttpErrorMetric.recordCount(1)
          }

          //this feed has a funny character at the start of it http://en.wikipedia.org/wiki/Zero-width_non-breaking_space
          //I have reported to PA, but just trimming here so we can carry on development
          pa.Response(r.status, r.body.dropWhile(_ != '<'), r.statusText)
        }
      }
  }

  def http = _http
  def http_=(delegateHttp: Http) = _http = delegateHttp

  lazy val apiKey = Configuration.pa.apiKey

  override def GET(urlString: String): Future[pa.Response] = {
    _http.GET(urlString)
  }
}

class SwitchBoardPlugin(app: PlayApp) extends SwitchBoardAgent(Configuration)

object Management extends GuManagement {
  val applicationName = "frontend-sport"
  val metrics = Metrics.contentApi ++ Metrics.common ++ Metrics.pa

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(
      "/football/live",
      "/football/premierleague/results"
    ),
    StatusPage(applicationName, metrics),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}