package controllers.commercial

import common.commercial.hosted.hardcoded.{HostedPages, LegacyHostedPages}
import common.commercial.hosted.{HostedArticlePage, HostedGalleryPage, HostedPage, HostedVideoPage}
import model.Cached.RevalidatableResult
import model.{Cached, NoCache}
import play.api.mvc.{Action, Controller}
import views.html.hosted.{guardianHostedArticle, guardianHostedGallery, guardianHostedVideo}

class HostedContentController extends Controller {

  private def renderPage(
    campaignName: String,
    pageName: String,
    fromCampaignAndPageName: (String, String) => Option[HostedPage]
  ) = Action { implicit request =>
    fromCampaignAndPageName(campaignName, pageName) match {
      case Some(page: HostedVideoPage) => Cached(60)(RevalidatableResult.Ok(guardianHostedVideo(page)))
      case Some(page: HostedGalleryPage) => Cached(60)(RevalidatableResult.Ok(guardianHostedGallery(page)))
      case Some(page: HostedArticlePage) => Cached(60)(RevalidatableResult.Ok(guardianHostedArticle(page)))
      case _ => NoCache(NotFound)
    }
  }

  def renderLegacyHostedPage(campaignName: String, pageName: String) =
    renderPage(campaignName, pageName, LegacyHostedPages.fromCampaignAndPageName)

  def renderHostedPage(campaignName: String, pageName: String) =
    renderPage(campaignName, pageName, HostedPages.fromCampaignAndPageName)
}
