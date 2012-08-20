package conf

import common._
import com.gu.management._
import com.gu.management.play._
import logback.LogbackLevelPage
import pa.{ DispatchHttp, PaClient }

object Configuration extends GuardianConfiguration("frontend-football", webappConfDirectory = "env") {

  object pa {
    lazy val apiKey = configuration.getStringProperty("pa.api.key")
      .getOrElse(throw new RuntimeException("unable to load pa api key"))
  }

}

object ContentApi extends ContentApiClient(Configuration)

object FootballClient extends PaClient with DispatchHttp {
  lazy val apiKey = Configuration.pa.apiKey
}

object Static extends StaticAssets(Configuration.static.path)

object Switches {
  //  val switch = new DefaultSwitch("name", "Description Text")
  val all: Seq[Switchable] = List(Healthcheck.switch)
}

object Metrics {
  val all: Seq[Metric] = ContentApi.metrics.all ++ CommonMetrics.all
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
