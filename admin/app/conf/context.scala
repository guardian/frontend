package conf

import _root_.play.api.mvc.Action
import common.Metrics
import com.gu.management._
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage
import com.gu.management.HttpRequest
import java.util.concurrent.atomic.AtomicBoolean

// temporary till JVM bug fix comes out
// see https://blogs.oracle.com/joew/entry/jdk_7u45_aws_issue_123
object AdminHealthCheckPage extends UrlPagesHealthcheckManagementPage("/login") {
  private lazy val status = new AtomicBoolean(true)
  def isOK = status.get
  def setUnhealthy(){ status.set(false) }
  override def get(req: HttpRequest) =  if (isOK) super.get(req) else ErrorResponse(500, "JAXP00010001")
}

object Management extends GuManagement {
  val applicationName = "frontend-admin"
  val metrics = Metrics.admin

  lazy val pages = List(
    new ManifestPage,
    AdminHealthCheckPage,
    StatusPage(applicationName, metrics),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
