package controllers.commercial

import common.commercial.HostedPage
import conf.switches.Switches
import model.Cached.RevalidatableResult
import model.{Cached, NoCache}
import play.api.mvc.{Action, Controller}
import views.html.hosted.{episode1Video, guardianHostedPage, teaserVideo}

object HostedContentController extends Controller {

  def renderHostedPage(pageName: String) = Action { implicit request =>
    val page = HostedPage(pageName)
    pageName match {

      case "design-competition-teaser" =>
        Cached(60)(RevalidatableResult.Ok(guardianHostedPage(page, teaserVideo())))

      case "design-competition-episode1" =>
        if (Switches.hostedEpisode1Content.isSwitchedOn) {
          Cached(60)(RevalidatableResult.Ok(guardianHostedPage(page, episode1Video())))
        } else {
          NoCache(NotFound)
        }

      case _ =>
        NoCache(NotFound)
    }
  }
}
