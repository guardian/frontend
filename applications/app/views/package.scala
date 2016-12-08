package views

import common.Edition
import model.Interactive
import play.api.Environment
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import services.IndexPage
import views.support._

object InteractiveBodyCleaner {
  def apply(interactive: Interactive)(implicit request: RequestHeader, env: Environment): Html = {
    val html = interactive.fields.body
    val cleaners = List(
      AtomsCleaner(interactive.content.atoms, shouldFence = false)
    ) ++ (if (interactive.content.isImmersive) List(InteractiveSrcdocCleaner) else Nil)

    withJsoup(html)(cleaners: _*)
  }
}

object FrontsCleaner {
 def apply(page: IndexPage, html: String)(implicit request: RequestHeader, env: Environment) = {
    val edition = Edition(request)
    withJsoup(BulletCleaner(html))(
      CommercialComponentHigh(isAdvertisementFeature = false, isNetworkFront = false, hasPageSkin = page.page.metadata.hasPageSkin(edition))
    )
  }
}
