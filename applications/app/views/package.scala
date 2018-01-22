package views

import model.{ApplicationContext, Interactive}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
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
