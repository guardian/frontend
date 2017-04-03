package views

import common.Edition
import model.{ApplicationContext, Interactive}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import services.IndexPage
import views.support._

object InteractiveBodyCleaner {
  def apply(interactive: Interactive)(implicit request: RequestHeader, context: ApplicationContext): Html = {
    val html = interactive.fields.body
    val cleaners = List(
      AtomsCleaner(interactive.content.atoms, shouldFence = false)
    ) ++ (if (interactive.content.isImmersive) List(InteractiveSrcdocCleaner) else Nil)

    withJsoup(html)(cleaners: _*)
  }
}

object IndexCleaner {
 def apply(page: IndexPage, html: String)(implicit request: RequestHeader, context: ApplicationContext) = {
    val edition = Edition(request)
    withJsoup(BulletCleaner(html))(
      CommercialComponentHigh(isPaidContent = false, isNetworkFront = false, hasPageSkin = page.page.metadata.hasPageSkin(edition)),
      CommercialMPUForFronts(isNetworkFront = false)
    )
  }
}
