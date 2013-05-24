package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ Result, RequestHeader, Controller, Action }
import org.joda.time.DateTime
import org.scala_tools.time.Implicits._

import concurrent.Future

case class TagAndTrails(tag: Tag, trails: Seq[Trail], leadContent: Seq[Trail])

object TagController extends Controller with Logging with JsonTrails with ExecutionContexts with implicits.Collections {

  def render(path: String) = Action { implicit request =>
    val promiseOfTag = lookup(path)
    Async {
      promiseOfTag.map {
        case Left(model) => renderTag(model)
        case Right(notFound) => notFound
      }
    }
  }

  def renderTrails(path: String) = Action { implicit request =>
    val promiseOfTag = lookup(path)
    Async {
      promiseOfTag.map {
        case Left(model) => renderTrailsFragment(model)
        case Right(notFound) => notFound
      }
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader) = {
    val edition = Edition(request)
    log.info(s"Fetching tag: $path for edition $edition")

    ContentApi.item(path, edition).showEditorsPicks(true).pageSize(20).response.map{ response: ItemResponse =>

      val tag = response.tag map { new Tag(_) }

      val leadContentCutOff = DateTime.now - 7.days
      val editorsPicks: Seq[Content] = response.editorsPicks.map(new Content(_))

      val leadContent: Seq[Content] = if (editorsPicks.isEmpty)
        response.leadContent.take(1).map { new Content(_) }.filter(_.webPublicationDate > leadContentCutOff)
      else
        Nil

      val latest: Seq[Content] = response.results.map(new Content(_)).filterNot(c => leadContent.map(_.id).exists(_ == c.id))

      val allTrails = (editorsPicks ++ latest).distinctBy(_.id).take(20)

      val model = tag map { TagAndTrails(_, allTrails, leadContent) }
      ModelOrResult(model, response)

    }.recover{suppressApiNotFound}
  }

  private def renderTag(model: TagAndTrails)(implicit request: RequestHeader) = {
    val htmlResponse = () => views.html.tag(model.tag, model.trails, model.leadContent)
    val jsonResponse = () => views.html.fragments.tagBody(model.tag, model.trails, model.leadContent)
    renderFormat(htmlResponse, jsonResponse, model.tag, Switches.all)
  }
  
  private def renderTrailsFragment(model: TagAndTrails)(implicit request: RequestHeader) = {
    val response = () => views.html.fragments.trailblocks.headline(model.trails, numItemsVisible = model.trails.size)
    renderFormat(response, response, model.tag)
  }
  
}