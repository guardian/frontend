package conf

import common.Metrics
import com.gu.management.{ PropertiesPage, StatusPage, ManifestPage, ManagementPage, PlainTextResponse }
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage
import _root_.play.api.{ Application => PlayApp }
import com.gu.management.HttpRequest
import controllers.front.{CollectionAgent, ConfigAgent}

class SwitchBoardPlugin(app: PlayApp) extends SwitchBoardAgent(Configuration)

object Management extends GuManagement {
  val applicationName = "frontend-facia"
  val metrics = Metrics.facia ++ Metrics.contentApi ++ Metrics.common

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage("/"),
    StatusPage(applicationName, metrics),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName),
    ConfigAgentStatus,
    CollectionAgentStatus
  )
}

object ConfigAgentStatus extends ManagementPage {
  val path: String = "/management/configagentstatus"
  def get(request: HttpRequest) = PlainTextResponse(ConfigAgent.contentsAsJsonString)
}

object CollectionAgentStatus extends ManagementPage {
  val path: String = "/management/collectionagentstatus"
  def get(request: HttpRequest) = PlainTextResponse(CollectionAgent.contentsAsJsonString)
}
