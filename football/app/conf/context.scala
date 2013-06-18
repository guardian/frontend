package conf

import common.PaMetrics._
import common.{Logging, ExecutionContexts, Metrics}
import com.gu.management.{ PropertiesPage, StatusPage, ManifestPage }
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage
import feed.Competitions
import model.{TeamMap, LiveBlog}
import pa.{Http, PaClient}
import play.api.{Application => PlayApp, Plugin}
import play.api.libs.ws.WS
import scala.concurrent.Future

class FootballStatsPlugin(app: PlayApp) extends Plugin {

  override def onStart() {
    Competitions.startup()
    LiveBlog.startup()
    TeamMap.startup()
  }

  override def onStop() {
    Competitions.shutDown()
    LiveBlog.shutdown()
    TeamMap.shutdown()
  }
}

object FootballClient extends PaClient with Http with Logging with ExecutionContexts {

  override lazy val base = Configuration.pa.host

  private var _http: Http = new Http {
    override def GET(urlString: String): Future[pa.Response] = {
        val start = System.currentTimeMillis()
        val promiseOfResponse = WS.url(urlString).withTimeout(2000).get()
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
  val applicationName = "frontend-football"
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