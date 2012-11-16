package conf

import _root_.play.api.{ Application => PlayApp, Plugin }
import common._
import com.gu.management._
import com.gu.management.play._
import feed.Competitions
import logback.LogbackLevelPage
import pa.{ Http, Proxy, DispatchHttp, PaClient }
import model.LiveBlog

object Configuration extends GuardianConfiguration("frontend-football", webappConfDirectory = "env") {

  object pa {
    lazy val apiKey = configuration.getStringProperty("pa.api.key")
      .getOrElse(throw new RuntimeException("unable to load pa api key"))

    lazy val host = configuration.getStringProperty("football.api.host").getOrElse("http://pads6.pa-sport.com")
  }

}

object ContentApi extends ContentApiClient(Configuration)

class FootballStatsPlugin(app: PlayApp) extends Plugin {
  object dispatchHttp extends DispatchHttp {
    override lazy val maxConnections = 50
    override lazy val requestTimeoutInMs = 5000
    override lazy val proxy = if (Configuration.proxy.isDefined)
      Some(Proxy(Configuration.proxy.host, Configuration.proxy.port))
    else
      None
  }

  override def onStart() = {
    FootballClient.http = dispatchHttp
    Competitions.startup()
    LiveBlog.startup()
  }

  override def onStop() = {
    Competitions.shutDown()
    LiveBlog.shutdown()
    dispatchHttp.close()
  }
}

object FootballClient extends PaClient with Http {

  override lazy val base = Configuration.pa.host

  private var _http: Http = _

  def http = _http
  def http_=(delegateHttp: Http) = _http = delegateHttp

  lazy val apiKey = Configuration.pa.apiKey

  override def GET(urlString: String): pa.Response = {

    val response = _http.GET(urlString)

    //this feed has a funny character at the start of it http://en.wikipedia.org/wiki/Zero-width_non-breaking_space
    //I have reported to PA, but just trimming here so we can carry on development
    response.copy(body = response.body.dropWhile(_ != '<'))
  }
}

object Static extends StaticAssets(Configuration.static.path)

object Switches {
  val all: Seq[Switchable] = CommonSwitches.all
}

class SwitchBoardPlugin(app: PlayApp) extends SwitchBoardAgent(Configuration, Switches.all)

object PaApiHttpTimingMetric extends TimingMetric(
  "performance",
  "pa-api-calls",
  "PA API calls",
  "outgoing requests to pa api",
  Some(RequestMetrics.RequestTimingMetric)
) with TimingMetricLogging

object Metrics {
  val all: Seq[Metric] = ContentApi.metrics.all ++ CommonMetrics.all ++ Seq(PaApiHttpTimingMetric)
}

object Management extends Management {
  val applicationName = Configuration.application

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(Configuration.healthcheck.urls.toList),
    new Switchboard(Switches.all, applicationName),
    StatusPage(applicationName, Metrics.all),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}