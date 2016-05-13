package controllers.commercial

import model.Cached.RevalidatableResult
import model.{GuardianContentTypes, MetaData, Cached, NoCache}
import model.commercial.HostedPage
import play.api.mvc.{Action, Controller}
import conf.switches.Switches.HostedContent

object StaticPageController extends Controller {
  def renderGuardianHostedPage() = Action { implicit request =>
    if (HostedContent.isSwitchedOn) {
      val metadata: MetaData = MetaData.make(
        id = "guardian-hosted",
        webTitle = "Guardian Hosted",
        section = "Hosted",
        contentType = GuardianContentTypes.Hosted,
        analyticsName = "hosted",
        shouldGoogleIndex = false
      )
      val hostedPage = HostedPage(metadata)
      Cached(60)(RevalidatableResult.Ok(views.html.static.guardianHostedPage(hostedPage)))
    } else {
      NoCache(NotFound)
    }
  }
}
