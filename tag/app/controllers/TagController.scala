package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ Result, RequestHeader, Controller, Action }
import org.joda.time.DateTime
import org.scala_tools.time.Implicits._
import play.api.libs.concurrent.Execution.Implicits._
import concurrent.Future

case class TagAndTrails(tag: Tag, trails: Seq[Trail], leadContent: Seq[Trail])

object TagController extends Controller with Logging with JsonTrails {

  def render(path: String) = Action { implicit request =>
    val promiseOfTag = lookup(path)
    Async {
      promiseOfTag.map {
        case Left(model) => renderTag(model)
        case Right(notFound) => notFound
      }
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader) = {
    val edition = Edition(request)
    log.info(s"Fetching tag: $path for edition $edition")

    ContentApi.item(path, edition).pageSize(20).response.map{response =>
      val tag = response.tag map { new Tag(_) }
      val trails = response.results map { new Content(_) }
      val leadContentCutOff = DateTime.now - 7.days
      val leadContent = response.leadContent.take(1).map { new Content(_) }.filter(_.webPublicationDate > leadContentCutOff)
      val leadContentIds = leadContent map (_.id)
      val model = tag map { TagAndTrails(_, trails.filter(c => !leadContentIds.exists(_ == c.id)), leadContent) }
      ModelOrResult(model, response)
    }.recover{suppressApiNotFound}
  }

  private def renderTag(model: TagAndTrails)(implicit request: RequestHeader) = {
    val htmlResponse = views.html.tag(model.tag, model.trails, model.leadContent)
    val jsonResponse = views.html.fragments.tagBody(model.tag, model.trails, model.leadContent)
    renderFormat(htmlResponse, jsonResponse, model.tag)
  }
  
}