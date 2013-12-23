package conf

import com.gu.management._
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage
import java.util.concurrent.atomic.AtomicBoolean
import com.gu.management.HttpRequest

// temporary till JVM bug fix comes out
// see https://blogs.oracle.com/joew/entry/jdk_7u45_aws_issue_123
object PorterHealthCheckPage extends UrlPagesHealthcheckManagementPage("/") {
  private lazy val status = new AtomicBoolean(true)
  def isOK = status.get
  def setUnhealthy(){ status.set(false) }
  override def get(req: HttpRequest) =  if (isOK) super.get(req) else ErrorResponse(500, "JAXP00010001")
}

object Management extends GuManagement {
  val applicationName = "frontend-porter"

  lazy val pages = List(
    new ManifestPage,
    PorterHealthCheckPage,
    StatusPage(applicationName, Nil),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
