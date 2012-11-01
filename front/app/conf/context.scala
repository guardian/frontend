package conf

import common._
import com.gu.management._
import com.gu.management.play._
import logback.LogbackLevelPage
import java.net.{ HttpURLConnection, URL }
import common._

object Configuration extends GuardianConfiguration("frontend-front", webappConfDirectory = "env") {

  lazy val configUrl = configuration.getStringProperty("front.config")
    .getOrElse(throw new RuntimeException("Front config url not set"))

}

object ContentApi extends ContentApiClient(Configuration) {

  //all calls from the front are async, none of them are blocking, so we allow a longer timeout.
  override lazy val requestTimeoutInMs = 7000
}

object Static extends StaticAssets(Configuration.static.path)

object Switches {
  val all: Seq[Switchable] = CommonSwitches.all // ++ new DefaultSwitch("name", "Description Text")
}

object Metrics {
  val all: Seq[Metric] = ContentApi.metrics.all ++ CommonMetrics.all
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