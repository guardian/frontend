package controllers

import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.libs.concurrent.Execution.Implicits._
import com.gu.openplatform.contentapi.ApiError

case class Related(heading: String, trails: Seq[Trail])

object RelatedController extends Controller with Logging {

  def render(path: String) = Action { implicit request =>
    val edition = Edition(request)
    val promiseOfRelated = lookup(edition, path)
    Async {
      promiseOfRelated.map(_.map {
        case Related(_, Nil) => JsonNotFound()
        case r => renderRelated(r)
      } getOrElse { JsonNotFound() })
    }
  }

  private def lookup(edition: String, path: String)(implicit request: RequestHeader) = {
    log.info(s"Fetching related content for : $path for edition $edition")
    ContentApi.item(path, edition)
      .tag(None)
      .showRelated(true)
      .response.map {response =>
      val heading = "Related content"
      val related = SupportedContentFilter(response.relatedContent map { new Content(_) })

      Some(Related(heading, related))
    }.recover{ case ApiError(404, message) =>
      log.info(s"Got a 404 while calling content api: $message")
      None
    }
  }

  private def renderRelated(model: Related)(implicit request: RequestHeader) = {
    Cached(900)(JsonComponent(views.html.fragments.relatedTrails(model.trails, model.heading, 5)))
  }
}
