package commercial.controllers

import com.gu.contentapi.client.model.ItemQuery
import commercial.model.hosted.HostedTrails
import common.commercial.hosted._
import common.{Edition, ExecutionContexts, JsonComponent, JsonNotFound, Logging}
import contentapi.ContentApiClient
import model.Cached.RevalidatableResult
import model.{Cached, NoCache}
import play.api.Environment
import play.api.libs.json.{JsArray, Json}
import play.api.mvc._
import play.twirl.api.Html
import views.html.hosted._

import scala.concurrent.Future
import scala.util.control.NonFatal

class HostedContentController(contentApiClient: ContentApiClient)(implicit env: Environment)
  extends Controller with ExecutionContexts with Logging with implicits.Requests {

  private def cacheDuration: Int = 60

  private def renderPage(hostedPage: Future[Option[HostedPage]])
    (implicit request: Request[AnyContent]): Future[Result] = {
    def cached(html: Html) = Cached(cacheDuration)(RevalidatableResult.Ok(html))
    hostedPage map {
      case Some(page: HostedVideoPage) =>
        cached {
          if (request.isAmp) guardianAmpHostedVideo(page)
          else guardianHostedVideo(page)
        }
      case Some(page: HostedGalleryPage) =>
        cached {
          if (request.isAmp) guardianAmpHostedGallery(page)
          else guardianHostedGallery(page)
        }
      case Some(page: HostedArticlePage) =>
        cached {
          if (request.isAmp) guardianAmpHostedArticle(page)
          else guardianHostedArticle(page)
        }
      case _ => NoCache(NotFound)
    }
  }

  private def baseQuery(itemId: String)(implicit request: Request[AnyContent]): ItemQuery =
    contentApiClient.item(itemId, Edition(request))
    .showSection(true)
    .showElements("all")
    .showFields("all")
    .showTags("all")
    .showAtoms("all")

  def renderLegacyHostedPage(campaignName: String, pageName: String) = Action.async { implicit request =>
    renderPage(Future.successful(hardcoded.LegacyHostedPages.fromCampaignAndPageName(campaignName, pageName)))
  }

  def renderHostedPage(campaignName: String, pageName: String) = Action.async { implicit request =>

    val capiResponse = {
      val itemId = s"advertiser-content/$campaignName/$pageName"
      val response = contentApiClient.getResponse(baseQuery(itemId))
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

      def onwardView(trails: Seq[HostedPage], defaultRowCount: Int, maxRowCount: Int): RevalidatableResult = {
        if (request.isAmp) {
          def toJson(trail: HostedPage) = Json.obj(
            "title" -> trail.title,
            "url" -> trail.url,
            "imageUrl" -> trail.imageUrl
          )
          JsonComponent {
            "items" -> JsArray(Seq(Json.obj(
              "owner" -> trails.headOption.map(_.campaign.owner),
              "trails" -> JsArray(trails.take(defaultRowCount).map(toJson))
            )))
          }
        } else {
          JsonComponent(hostedOnwardJourney(trails, defaultRowCount, maxRowCount))
        }
      }

      def galleryOnwardView(trails: Seq[HostedPage]): RevalidatableResult = {
        if (request.isAmp) {
          def toJson(trail: HostedPage) = Json.obj(
            "url" -> trail.url,
            "imageUrl" -> trail.imageUrl
          )
          JsonComponent {
            val cta = trails.headOption.map(_.cta)
            "items" -> JsArray(Seq(Json.obj(
              "ctaText" -> cta.map(_.label),
              "ctaLink" -> cta.map(_.url),
              "buttonText" -> cta.map(_.btnText),
              "trails" -> JsArray(trails.map(toJson))
            )))
          }
        } else {
          JsonComponent(hostedGalleryOnward(trails))
        }
      }

      val capiResponse = {
        val sectionId = s"advertiser-content/$campaignName"
        val query = baseQuery(sectionId)
                    .pageSize(100)
                    .orderBy("oldest")
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
              val trails = HostedTrails.fromContent(itemId, results)
              Cached(cacheDuration)(onwardView(trails, 1, 1))
            case "article" =>
              val trails = HostedTrails.fromContent(itemId, results)
              Cached(cacheDuration)(onwardView(trails, 2, 4))
            case "gallery" =>
              val trails = HostedTrails.fromContent(itemId, trailCount = 2, results)
              Cached(cacheDuration)(galleryOnwardView(trails))
            case _ =>
              Cached(0)(JsonNotFound())
          }
        } getOrElse {
          Cached(0)(JsonNotFound())
        }
      }
  }
}
