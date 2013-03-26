package conf

import play.api.{ Application => PlayApp }
import common._
import com.gu.management._
import com.gu.management.play._
import logback.LogbackLevelPage

object Switches {
  val all: Seq[Switchable] = CommonSwitches.all // ++ new DefaultSwitch("name", "Description Text")
}

class SwitchBoardPlugin(app: PlayApp) extends SwitchBoardAgent(Configuration, Switches.all)

object Metrics {
  val all: Seq[Metric] = ContentApiMetrics.all ++ CommonMetrics.all
}

object Management extends Management {
  val applicationName = "frontend-video"

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(
      "/world/video/2012/nov/20/australian-fake-bomber-sentenced-sydney-teenager-video"
    ),
    StatusPage(applicationName, Metrics.all),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}