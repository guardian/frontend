package controllers

import com.gu.contentapi.client.model.ContentApiError
import common._
import contentapi.ContentApiClient
import feed.MostReadAgent
import model._
import play.api.libs.json.{JsArray, Json}
import play.api.mvc._
import services._

import scala.concurrent.Future

class TaggedContentController(
    val contentApiClient: ContentApiClient,
    val mostReadAgent: MostReadAgent,
    val controllerComponents: ControllerComponents,
) extends BaseController
    with Related
    with GuLogging
    with ImplicitControllerExecutionContext {

  def renderJson(tag: String): Action[AnyContent] =
    Action.async { implicit request =>
      tagWhitelist.find(_ == tag).map { tag =>
        lookup(tag, Edition(request)) map {
          case Nil    => Cached(300) { JsonNotFound() }
          case trails => render(trails)
        }
      } getOrElse Future {
        BadRequest
      }
    }

  private def render(trails: Seq[ContentType])(implicit request: RequestHeader): Result =
    Cached(300) {
      common.JsonComponent(
        "trails" -> JsArray(trails.map { trail =>
          Json.obj(
            ("webTitle", trail.metadata.webTitle),
            ("webUrl", trail.metadata.webUrl),
            ("sectionName", trail.trail.sectionName),
            ("thumbnail", trail.trail.thumbnailPath),
            ("starRating", trail.content.starRating),
            ("isLive", trail.fields.isLive),
          )
        }),
      )
    }

  private val tagWhitelist: Seq[String] = Seq(
    "tone/minutebyminute",
    "tone/reviews,culture/culture",
    "theguardian/series/guardiancommentcartoon",
  )

  private def lookup(tag: String, edition: Edition)(implicit request: RequestHeader): Future[List[ContentType]] = {
    log.info(s"Fetching tagged stories for edition ${edition.id}")
    contentApiClient
      .getResponse(
        contentApiClient
          .search(edition)
          .tag(tag)
          .pageSize(3),
      )
      .map { response =>
        response.results.toList map { Content(_) }
      } recover {
      case ContentApiError(404, message, _) =>
        log.info(s"Got a 404 while calling content api: $message")
        Nil
    }
  }
}
