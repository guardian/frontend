package controllers.commercial

import conf.switches.Switches.HostedContent
import model.Cached.RevalidatableResult
import model.{Cached, NoCache}
import play.api.mvc.{Action, Controller}

object StaticPageController extends Controller {

  def renderGuardianHostedPage() = Action { implicit request =>
    if (HostedContent.isSwitchedOn) {
      Cached(60)(RevalidatableResult.Ok(views.html.static.guardianHostedPage()))
    } else {
      NoCache(NotFound)
    }
  }
}
