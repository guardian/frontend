package views

import common.Edition
import model.PressedPage
import play.api.Environment
import play.api.mvc.RequestHeader
import views.support.{CommercialComponentHigh, BulletCleaner}
import views.support.`package`.withJsoup

object FrontsCleaner {
 def apply(page: PressedPage, html: String)(implicit request: RequestHeader, env: Environment) = {
    val edition = Edition(request)
    withJsoup(BulletCleaner(html))(
      CommercialComponentHigh(page.frontProperties.isAdvertisementFeature, page.isNetworkFront, page.metadata.hasPageSkin(edition))
    )
  }
}