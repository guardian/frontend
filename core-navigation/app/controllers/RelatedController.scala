package controllers

import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }

import com.gu.openplatform.contentapi.ApiError

case class Related(heading: String, trails: Seq[Trail])

object RelatedController extends Controller with Logging with ExecutionContexts {

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

  private def lookup(edition: Edition, path: String)(implicit request: RequestHeader) = {
    log.info(s"Fetching related content for : $path for edition ${edition.id}")
    ContentApi.item(path, edition)
      .tag(None)
      .showFields("all")
      .showRelated(true)
      .response.map {response =>
      val heading = "Related content"
      val related = SupportedContentFilter(response.relatedContent map { Content(_) })

      Some(Related(heading, related))
    }.recover{ case ApiError(404, message) =>
      log.info(s"Got a 404 while calling content api: $message")
      None
    }
  }

  private def renderRelated(model: Related)(implicit request: RequestHeader) = {
    Cached(900){
      val html = views.html.fragments.relatedTrails(model.trails, model.heading, 5)
      if (request.isJson)
        JsonComponent(
          "html" -> html,
          "trails" -> model.trails.map(_.url)
        )
      else
        Ok(html)
    }
  }
}
