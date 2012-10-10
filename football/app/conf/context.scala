package conf

import common._
import com.gu.management._
import com.gu.management.play._
import logback.LogbackLevelPage
import pa.{ Http, Proxy, DispatchHttp, PaClient }

object Configuration extends GuardianConfiguration("frontend-football", webappConfDirectory = "env") {

  object pa {
    lazy val apiKey = configuration.getStringProperty("pa.api.key")
      .getOrElse(throw new RuntimeException("unable to load pa api key"))
  }

}

object ContentApi extends ContentApiClient(Configuration)

object FootballClient extends PaClient with DelegatedHttp {
  lazy val apiKey = Configuration.pa.apiKey
}

object Static extends StaticAssets(Configuration.static.path)

object Switches {
  val all: Seq[Switchable] = List(Healthcheck.switch)
}

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
    new HealthcheckManagementPage,
    new Switchboard(Switches.all, applicationName),
    StatusPage(applicationName, Metrics.all),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}

sealed trait DelegatedHttp extends Http with Logging {

  private var delegate: Http = new DispatchHttp {
    override lazy val maxConnections = 50

    override lazy val requestTimeoutInMs = 5000

    override lazy val proxy = if (Configuration.proxy.isDefined)
      Some(Proxy(Configuration.proxy.host, Configuration.proxy.port))
    else
      None
  }

  def setHttp(http: Http) { delegate = http }

  override def GET(url: String) = PaApiHttpTimingMetric.measure {
    log.info("PA API call: " + url)
    delegate.GET(url)
  }
}
