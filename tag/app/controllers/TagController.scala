package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ Result, RequestHeader, Controller, Action }
import org.joda.time.DateTime
import org.scala_tools.time.Implicits._
import play.api.Play.current
import play.api.libs.concurrent.Akka

case class TagAndTrails(tag: Tag, trails: Seq[Trail], leadContent: Seq[Trail])

object TagController extends Controller with Logging with JsonTrails {

  def render(path: String) = Action { implicit request =>
    val promiseOfTag = Akka.future(lookup(path))
    Async {
      promiseOfTag.map {
        case Left(model) => renderTag(model, "html")
        case Right(notFound) => notFound
      }
    }
  }

  def renderJson(path: String) = Action { implicit request =>
    val promiseOfTag = Akka.future(lookup(path))
    Async {
      promiseOfTag.map {
        case Left(model) => renderTag(model, "json")
        case Right(notFound) => notFound
      }
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader): Either[TagAndTrails, Result] = suppressApi404 {
    val edition = Site(request).edition
    log.info("Fetching tag: " + path + " for edition " + edition)

    val response: ItemResponse = ContentApi.item(path, edition).pageSize(20).response

    val tag = response.tag map { new Tag(_) }

    val trails = response.results map { new Content(_) }

    val leadContentCutOff = DateTime.now - 7.days

    val leadContent = response.leadContent.take(1).map { new Content(_) }.filter(_.webPublicationDate > leadContentCutOff)

    val leadContentIds = leadContent map (_.id)

    val model = tag map { TagAndTrails(_, trails.filter(c => !leadContentIds.exists(_ == c.id)), leadContent) }

    ModelOrResult(model, response)
  }

  private def renderTag(model: TagAndTrails, format: String)(implicit request: RequestHeader) = Cached(model.tag) {
    if (format == "json") {
      renderJsonTrails(model.trails)
    } else {
      Ok(Compressed(views.html.tag(model.tag, model.trails, model.leadContent)))
    }
  }
}