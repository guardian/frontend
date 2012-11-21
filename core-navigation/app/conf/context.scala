package conf

import play.api.{ Application => PlayApp }
import common._
import com.gu.management.{ PropertiesPage, StatusPage, ManifestPage, Switchable, Metric }
import com.gu.management.play.{ Management => GuManagement }

import com.gu.management.logback.LogbackLevelPage

object Switches {
  val all: Seq[Switchable] = CommonSwitches.all
}

class SwitchBoardPlugin(app: PlayApp) extends SwitchBoardAgent(Configuration, Switches.all)

object Metrics {
  val all: Seq[Metric] = ContentApi.metrics.all ++ CommonMetrics.all
}

object Management extends GuManagement {
  val applicationName = Configuration.application

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(
      "/core-navigation/top-stories/UK?callback=navigation",
      "/core-navigation/most-popular/UK/society?callback=showMostPopular",
      "/core-navigation/related/UK/theobserver/2012/nov/18/the-big-issue-cyclists-versus-motorists?callback=showRelated"
    ),
    StatusPage(applicationName, Metrics.all),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
