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
  val all: Seq[Metric] = CommonMetrics.all
}

object Management extends Management {
  val applicationName = Configuration.application

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(
      // TODO: Add gif and png.
      "/resize/300/200/40/sys-images/Guardian/Pix/pictures/2012/12/9/1355060508064/Wernigerode-Germany-A-tra-011.jpg",
      "/resize/640/480/80/sys-images/Guardian/Pix/pictures/2012/12/9/1355060508064/Wernigerode-Germany-A-tra-011.jpg"
    ),
    StatusPage(applicationName, Metrics.all),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
