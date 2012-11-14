package conf

import common._
import _root_.play.api.{ Application => PlayApp }
import com.gu.management.play._
import com.gu.management._
import logback.LogbackLevelPage

object Configuration extends GuardianConfiguration("frontend-article", webappConfDirectory = "env")

object ContentApi extends ContentApiClient(Configuration)

object Static extends StaticAssets(Configuration.static.path)

object Switches {
  val all: Seq[Switchable] = CommonSwitches.all
}

class SwitchBoardPlugin(app: PlayApp) extends SwitchBoardAgent(Configuration, Switches.all)

object Metrics {
  val all: Seq[Metric] = ContentApi.metrics.all ++ CommonMetrics.all
}

object Management extends Management {
  val applicationName = Configuration.application

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(Configuration.healthcheck.urls.toList),
    new Switchboard(CommonSwitches.all, applicationName),
    StatusPage(applicationName, Metrics.all),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
