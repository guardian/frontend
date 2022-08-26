package commercial.controllers

import com.gu.contentapi.client.model.ContentApiError
import com.gu.contentapi.client.model.ItemQuery
import com.gu.contentapi.client.model.v1.ContentType.Video
import commercial.model.hosted.HostedTrails
import common.commercial.hosted._
import common.{Edition, ImplicitControllerExecutionContext, JsonComponent, JsonNotFound, GuLogging}
import contentapi.ContentApiClient
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.{ApplicationContext, Cached, NoCache}
import play.api.libs.json.{JsArray, Json}
import play.api.mvc._
import play.twirl.api.Html
import views.html.commercialExpired
import views.html.hosted._

import scala.concurrent.Future
import scala.util.control.NonFatal

class HostedContentController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with GuLogging
    with implicits.Requests {

  private def cacheDuration: Int = 60

  private def renderPage(
      hostedPage: Future[Option[HostedPage]],
  )(implicit request: Request[AnyContent]): Future[Result] = {
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
    } recover {
      case e: ContentApiError if e.httpStatus == 410 =>
        cached(commercialExpired(wasAHostedPage = true))
      case e: ContentApiError if e.httpStatus == 404 =>
        Cached(cacheDuration)(WithoutRevalidationResult(NotFound))
    }
  }

  private def baseQuery(itemId: String)(implicit request: Request[AnyContent]): ItemQuery =
    contentApiClient
      .item(itemId, Edition(request))
      .showSection(true)
      .showElements("all")
      .showFields("all")
      .showTags("all")
      .showAtoms("all")

  def renderHostedPage(campaignName: String, pageName: String): Action[AnyContent] =
    Action.async { implicit request =>
      val capiResponse = {
        val itemId = s"advertiser-content/$campaignName/$pageName"
        val response = contentApiClient.getResponse(baseQuery(itemId))
        response.failed.foreach {
          case NonFatal(e) => log.warn(s"Capi lookup of item '$itemId' failed: ${e.getMessage}", e)
        }
        response
      }

      val page = capiResponse map {
        _.content flatMap HostedPage.fromContent
      }

      renderPage(page)
    }

  def renderOnwardComponent(campaignName: String, pageName: String, contentType: String): Action[AnyContent] =
    Action.async { implicit request =>
      def onwardView(trails: Seq[HostedPage], defaultRowCount: Int, maxRowCount: Int): RevalidatableResult = {
        if (request.isAmp) {
          def toJson(trail: HostedPage) =
            Json.obj(
              "title" -> trail.title,
              "url" -> trail.url,
              "imageUrl" -> trail.thumbnailUrl,
            )
          JsonComponent {
            "items" -> JsArray(
              Seq(
                Json.obj(
                  "owner" -> trails.headOption.map(_.owner),
                  "trails" -> JsArray(trails.take(defaultRowCount).map(toJson)),
                ),
              ),
            )
          }
        } else {
          JsonComponent(hostedOnwardJourney(trails, maxRowCount))
        }
      }

      def galleryOnwardView(trails: Seq[HostedPage]): RevalidatableResult = {
        if (request.isAmp) {
          def toJson(trail: HostedPage) =
            Json.obj(
              "url" -> trail.url,
              "imageUrl" -> trail.thumbnailUrl,
            )
          JsonComponent {
            val cta = trails.headOption.map(_.cta)
            "items" -> JsArray(
              Seq(
                Json.obj(
                  "ctaText" -> cta.map(_.label),
                  "ctaLink" -> cta.map(_.url),
                  "buttonText" -> cta.map(_.btnText),
                  "trails" -> JsArray(trails.map(toJson)),
                ),
              ),
            )
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
        response.failed.foreach {
          case NonFatal(e) => log.warn(s"Capi lookup of item '$sectionId' failed: ${e.getMessage}", e)
        }
        response
      }

      capiResponse map { response =>
        response.results map { results =>
          val itemId = s"advertiser-content/$campaignName/$pageName"
          contentType match {
            case "video" =>
              val trails = HostedTrails.fromContent(itemId, results.toSeq)
              Cached(cacheDuration)(onwardView(trails, 1, 1))
            case "article" =>
              val trails = HostedTrails.fromContent(itemId, results.toSeq)
              Cached(cacheDuration)(onwardView(trails, 2, 4))
            case "gallery" =>
              val trails = HostedTrails.fromContent(itemId, trailCount = 2, results.toSeq)
              Cached(cacheDuration)(galleryOnwardView(trails))
            case _ =>
              Cached(0)(JsonNotFound())
          }
        } getOrElse {
          Cached(0)(JsonNotFound())
        }
      }
    }

  def renderAutoplayComponent(campaignName: String, pageName: String): Action[AnyContent] =
    Action.async { implicit request =>
      val capiResponse = {
        val sectionId = s"advertiser-content/$campaignName"
        val query = baseQuery(sectionId)
          .pageSize(100)
          .orderBy("oldest")
        val response = contentApiClient.getResponse(query)
        response.failed.foreach {
          case NonFatal(e) => log.warn(s"Capi lookup of item '$sectionId' failed: ${e.getMessage}", e)
        }
        response
      }

      capiResponse map { response =>
        response.results map { results =>
          val videoPages = results
            .filter(_.`type` == Video)
          val itemId = s"advertiser-content/$campaignName/$pageName"
          val trails = HostedTrails.fromContent(itemId, 1, videoPages.toSeq)
          Cached(cacheDuration)(JsonComponent(hostedVideoAutoplayWrapper(trails)))
        } getOrElse {
          Cached(0)(JsonNotFound())
        }
      }
    }
}
