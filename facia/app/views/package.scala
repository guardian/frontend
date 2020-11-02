package views

import common.Edition
import model.{ApplicationContext, PressedPage}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.support.{BulletCleaner, CommercialComponentHigh, CommercialMPUForFronts}
import views.support.`package`.withJsoup

object FrontsCleaner {
  def apply(page: PressedPage, html: Html)(implicit request: RequestHeader, context: ApplicationContext): Html = {
    val edition = Edition(request)
    withJsoup(BulletCleaner(html.toString))(
      CommercialComponentHigh(
        page.frontProperties.isPaidContent,
        page.isNetworkFront,
        page.metadata.hasPageSkin(request),
      ),
      CommercialMPUForFronts(),
    )
  }
}
