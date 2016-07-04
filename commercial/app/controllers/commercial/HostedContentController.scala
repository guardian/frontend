package controllers.commercial

import common.commercial.hosted.{HostedGalleryPage, HostedPage, HostedVideoPage}
import model.Cached.RevalidatableResult
import model.{Cached, NoCache}
import play.api.mvc.{Action, Controller}
import views.html.hosted.{guardianHostedGallery, guardianHostedVideo}

class HostedContentController extends Controller {

  def renderHostedPage(campaignName: String, pageName: String) = Action { implicit request =>
    HostedPage.fromPageName(campaignName, pageName) match {
      case Some(page: HostedVideoPage) => Cached(60)(RevalidatableResult.Ok(guardianHostedVideo(page)))
      case Some(page: HostedGalleryPage) => Cached(60)(RevalidatableResult.Ok(guardianHostedGallery(page)))
      case _ => NoCache(NotFound)
    }
  }
}

object HostedContentController extends HostedContentController
