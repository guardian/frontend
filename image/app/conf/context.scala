package conf

import common.Metrics
import com.gu.management.{ PropertiesPage, StatusPage, ManifestPage }
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage
import play.api.{ Application => PlayApp }

class SwitchBoardPlugin(app: PlayApp) extends SwitchBoardAgent(Configuration)

object Management extends GuManagement {
  val applicationName = Configuration.application
  val metrics = Metrics.common

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(
      // TODO: Add gif and png.
      "/resize/sclr/sys-images/Guardian/Pix/pictures/2013/4/14/1365945821204/John-Kerry-in-Tokyo-009.jpg"
    ),
    StatusPage(applicationName, metrics),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
