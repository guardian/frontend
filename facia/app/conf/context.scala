package conf

import common.Metrics
import com.gu.management.{ PropertiesPage, StatusPage, ManifestPage, ManagementPage, PlainTextResponse }
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage
import com.gu.management.HttpRequest
import controllers.front.ConfigAgent

object Management extends GuManagement {
  val applicationName = "frontend-facia"
  val metrics = Metrics.facia ++ Metrics.contentApi ++ Metrics.common

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(
      "/",
      "/uk",
      "/us",
      "/au",
      "/environment",
      "/science"
    ),
    StatusPage(applicationName, metrics),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName),
    new ConfigAgentStatus
  )
}

class ConfigAgentStatus extends ManagementPage {
  val path: String = "/management/configagentstatus"
  override lazy val linktext = "/management/configagentstatus - ONLY use for debugging"
  def get(request: HttpRequest) = PlainTextResponse(ConfigAgent.contentsAsJsonString)
}
