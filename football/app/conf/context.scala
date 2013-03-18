package conf

import _root_.play.api.libs.ws.WS
import play.api.{ Application => PlayApp, Plugin }
import play.api.libs.concurrent.Execution.Implicits._
import common._
import com.gu.management._
import com.gu.management.play._
import feed.Competitions
import logback.LogbackLevelPage
import pa.{ Http, PaClient }
import model.{ TeamMap, LiveBlog }
import concurrent.Future
import System.currentTimeMillis

class FootballStatsPlugin(app: PlayApp) extends Plugin {


  override def onStart() = {
    Competitions.startup()
    LiveBlog.startup()
    TeamMap.startup()
  }

  override def onStop() = {
    Competitions.shutDown()
    LiveBlog.shutdown()
    TeamMap.shutdown()
  }
}

object FootballClient extends PaClient with Http with Logging {

  override lazy val base = Configuration.pa.host

  private var _http: Http = new Http {
    override def GET(urlString: String): Future[pa.Response] = {
        val start = currentTimeMillis()
        val promiseOfResponse = WS.url(urlString).withTimeout(2000).get()
        promiseOfResponse.onComplete( r => PaApiHttpTimingMetric.recordTimeSpent(currentTimeMillis() - start))

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

object Switches {
  val all: Seq[Switchable] = CommonSwitches.all
}

class SwitchBoardPlugin(app: PlayApp) extends SwitchBoardAgent(Configuration, Switches.all)

object PaApiHttpTimingMetric extends TimingMetric(
  "pa-api",
  "pa-api-calls",
  "PA API calls",
  "outgoing requests to pa api",
  None
) with TimingMetricLogging

object PaApiHttpOkMetric extends CountMetric(
  "pa-api",
  "pa-api-ok",
  "PA API calls OK",
  "AP api returned OK"
)

object PaApiHttpErrorMetric extends CountMetric(
  "pa-api",
  "pa-api-error",
  "PA API calls error",
  "AP api returned error"
)

object Metrics {
  val all: Seq[Metric] = ContentApiMetrics.all ++ CommonMetrics.all ++ Seq(PaApiHttpTimingMetric, PaApiHttpOkMetric, PaApiHttpErrorMetric)
}

object Management extends Management {
  val applicationName = "frontend-football"

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(
      "/football/live",
      "/football/premierleague/results"
    ),
    StatusPage(applicationName, Metrics.all),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}