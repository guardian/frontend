package conf

import com.gu.management._
import com.gu.management.play._
import logback.LogbackLevelPage
import common._

object Switches {
  val all: Seq[Switchable] = CommonSwitches.all
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