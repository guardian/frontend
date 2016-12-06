package views

import model.Interactive
import play.api.Environment
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.support.{AtomsCleaner, InteractiveSrcdocCleaner, withJsoup}

object InteractiveBodyCleaner {
  def apply(interactive: Interactive)(implicit request: RequestHeader, env: Environment): Html = {
    val html = interactive.fields.body
    val cleaners = List(
      AtomsCleaner(interactive.content.atoms, shouldFence = false)
    ) ++ (if (interactive.content.isImmersive) List(InteractiveSrcdocCleaner) else Nil)

    withJsoup(html)(cleaners: _*)
  }
}
