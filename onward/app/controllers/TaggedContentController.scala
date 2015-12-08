package controllers

import com.gu.contentapi.client.GuardianContentApiError
import common._
import conf.LiveContentApi
import conf.LiveContentApi.getResponse
import model._
import play.api.libs.json.{JsArray, Json}
import play.api.mvc.{Action, Controller, RequestHeader}
import services._

import scala.concurrent.Future

object TaggedContentController extends Controller with Related with Logging with ExecutionContexts {

  def renderJson(tag: String) = Action.async { implicit request =>
    tagWhitelist.find(_ == tag).map { tag =>
      lookup(tag, Edition(request)) map {
        case Nil    => Cached(300) { JsonNotFound() }
        case trails => render(trails)
      }
    } getOrElse(Future { BadRequest })
  }

  private def render(trails: Seq[ContentType])(implicit request: RequestHeader) = Cached(300) {
    JsonComponent(
      "trails" -> JsArray(trails.map { trail =>
        Json.obj(
          ("webTitle", trail.metadata.webTitle),
          ("webUrl", trail.metadata.webUrl),
          ("sectionName", trail.trail.sectionName),
          ("thumbnail", trail.trail.thumbnailPath),
          ("starRating", trail.content.starRating),
          ("isLive", trail.fields.isLive)
        )
      })
    )
  }

  private val tagWhitelist: Seq[String] = Seq(
    "tone/minutebyminute",
    "tone/reviews,culture/culture",
    "theguardian/series/guardiancommentcartoon"
  )

  private def lookup(tag: String, edition: Edition)(implicit request: RequestHeader): Future[Seq[ContentType]] = {
    log.info(s"Fetching tagged stories for edition ${edition.id}")
    getResponse(LiveContentApi.search(edition)
      .tag(tag)
      .pageSize(3)
    ).map { response =>
        response.results map { Content(_) }
    } recover { case GuardianContentApiError(404, message, _) =>
      log.info(s"Got a 404 while calling content api: $message")
      Nil
    }
  }
}
