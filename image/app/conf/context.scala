package conf

import com.gu.management.ManifestPage
import com.gu.management.play.{ Management => GuManagement }
import com.gu.management.logback.LogbackLevelPage

object ImageServerHealthcheckPage extends UrlPagesHealthcheckManagementPage(
  "/sys-images/Guardian/About/General/2013/9/6/1378491229277/Airbnb-house-in-Pioneerto-011.jpg?width=460&height=-&quality=95"
){
  override val base = "http://localhost"
}


object Management extends GuManagement {
  val applicationName = "frontend-image"

  lazy val pages = List(
    new ManifestPage,
    ImageServerHealthcheckPage,
    new LogbackLevelPage(applicationName)
  )
}
