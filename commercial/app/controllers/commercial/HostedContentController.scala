package controllers.commercial

import common.commercial.hosted._
import common.{Edition, ExecutionContexts, JsonComponent, JsonNotFound, Logging}
import contentapi.ContentApiClient
import model.Cached.RevalidatableResult
import model.commercial.hosted.HostedTrails
import model.{Cached, NoCache}
import play.api.mvc._
import play.twirl.api.Html
import views.html.hosted._

import scala.concurrent.Future
import scala.util.control.NonFatal

class HostedContentController(contentApiClient: ContentApiClient)
  extends Controller with ExecutionContexts with Logging {

  private def cacheDuration: Int = 60

  private def renderPage(hostedPage: Future[Option[HostedPage]])
    (implicit request: Request[AnyContent]): Future[Result] = {
    def cached(html: Html) = Cached(cacheDuration)(RevalidatableResult.Ok(html))
    hostedPage map {
      case Some(page: HostedVideoPage) => cached(guardianHostedVideo(page))
      case Some(page: HostedGalleryPage) => cached(guardianHostedGallery(page))
      case Some(page: ZootropolisPage) => cached(zootropolisPage(page))
      case Some(page: HostedArticlePage) => cached(guardianHostedArticle(page))
      case _ => NoCache(NotFound)
    }
  }

  def renderLegacyHostedPage(campaignName: String, pageName: String) = Action.async { implicit request =>
    renderPage(Future.successful(hardcoded.LegacyHostedPages.fromCampaignAndPageName(campaignName, pageName)))
  }

  def renderHostedPage(campaignName: String, pageName: String) = Action.async { implicit request =>

    val capiResponse = {
      val itemId = s"advertiser-content/$campaignName/$pageName"
      val query = contentApiClient.item(itemId, Edition(request))
                  .showElements("all")
                  .showFields("all")
                  .showTags("all")
                  .showAtoms("all")
      val response = contentApiClient.getResponse(query)
      response.onFailure {
        case NonFatal(e) => log.warn(s"Capi lookup of item '$itemId' failed: ${e.getMessage}", e)
      }
      response
    }

    val contentFromCapi = capiResponse map {
      _.content flatMap HostedPage.fromContent
    }

    val page = contentFromCapi fallbackTo {
      Future.successful(hardcoded.HostedPages.fromCampaignAndPageName(campaignName, pageName))
    }

    renderPage(page)
  }

  def renderOnwardComponent(campaignName: String, pageName: String, contentType: String) = Action.async {
    implicit request =>

      val capiResponse = {
        val sectionId = s"advertiser-content/$campaignName"
        val query = contentApiClient.item(sectionId, Edition(request))
                    .pageSize(100)
                    .orderBy("oldest")
                    .showElements("all")
                    .showFields("all")
                    .showTags("all")
                    .showAtoms("all")
        val response = contentApiClient.getResponse(query)
        response.onFailure {
          case NonFatal(e) => log.warn(s"Capi lookup of item '$sectionId' failed: ${e.getMessage}", e)
        }
        response
      }

      capiResponse map { response =>
        response.results map { results =>
          val itemId = s"advertiser-content/$campaignName/$pageName"
          contentType match {
            case "video" =>
              val trails = HostedTrails.fromContent(itemId, trailCount = 1, results)
              Cached(cacheDuration)(JsonComponent(hostedVideoOnward(trails.headOption)))
            case "article" =>
              val trails = HostedTrails.fromContent(itemId, trailCount = 2, results)
              Cached(cacheDuration)(JsonComponent(hostedArticleOnward(trails)))
            case _ =>
              Cached(0)(JsonNotFound())
          }
        } getOrElse {
          Cached(0)(JsonNotFound())
        }
      }
  }
}
