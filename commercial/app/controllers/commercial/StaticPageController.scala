package controllers.commercial

import model.Cached.RevalidatableResult
import model.{MetaData, GuardianContentTypes, Cached, StandalonePage}
import play.api.mvc.{Action, Controller}

case class StaticGuardianHostedPage() extends StandalonePage {
  override val metadata: MetaData = MetaData.make(
    id = "guardian-hosted",
    webTitle = "Guardian Hosted",
    section = "global",
    contentType = GuardianContentTypes.Interactive,
    analyticsName = "guardian-hosted",
    shouldGoogleIndex = false
  )
}

object StaticPageController extends Controller {
  def renderGuardianHostedPage() = Action { implicit request =>
    Cached(60)(RevalidatableResult.Ok(views.html.static.guardianHostedPage(StaticGuardianHostedPage().metadata)))
  }
}
