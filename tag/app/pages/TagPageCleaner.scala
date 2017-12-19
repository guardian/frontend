package pages

import common.Edition
import model.ApplicationContext
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import services.TagPage
import views.support.{BulletCleaner, CommercialComponentHigh, CommercialMPUForFronts}
import views.support._

object TagPageCleaner {
  def apply(page: TagPage, html: Html)(implicit request: RequestHeader, context: ApplicationContext): Html = {
    val edition = Edition(request)
    withJsoup(BulletCleaner(html.toString))(
      CommercialComponentHigh(isPaidContent = false, isNetworkFront = false, hasPageSkin = page.page.metadata.hasPageSkin(edition)),
      CommercialMPUForFronts(isNetworkFront = false)
    )
  }
}
