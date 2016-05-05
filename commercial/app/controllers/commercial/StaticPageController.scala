package controllers.commercial

import model.Cached.RevalidatableResult
import model.{MetaData, GuardianContentTypes, Cached, StandalonePage}
import play.api.mvc.{Action, Controller}

case class StaticGuardianAwesomePage() extends StandalonePage {
  override val metadata: MetaData = MetaData.make(
    id = "guardian-awesome",
    webTitle = "Guardian Awesome",
    section = "global",
    contentType = GuardianContentTypes.Interactive,
    analyticsName = "guardian-awesome",
    shouldGoogleIndex = false
  )
}

object StaticPageController extends Controller {
  def renderGuardianAwesomePage() = Action { implicit request =>
    Cached(60)(RevalidatableResult.Ok(views.html.static.guardianAwesomePage(StaticGuardianAwesomePage().metadata)))
  }
}
