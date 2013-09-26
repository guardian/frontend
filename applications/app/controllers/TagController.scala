package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import org.joda.time.DateTime
import org.scala_tools.time.Implicits._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.libs.json._

import contentapi.QueryDefaults

case class TagAndTrails(tag: Tag, trails: Seq[Trail], leadContent: Seq[Trail])

object TagController extends Controller with Logging with JsonTrails with ExecutionContexts with implicits.Collections with QueryDefaults {

  def renderJson(path: String) = render(path)
  def render(path: String) = Action.async { implicit request =>
    lookup(path) map {
      case Left(model) => renderTag(model)
      case Right(notFound) => notFound
    }
  }

  def renderTrailsJson(path: String) = renderTrails(path)
  def renderTrails(path: String) = Action.async { implicit request =>
    lookup(path) map {
      case Left(model) => renderTrailsFragment(model)
      case Right(notFound) => notFound
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader) = {
    val edition = Edition(request)
    log.info(s"Fetching tag: $path for edition $edition")

    ContentApi.item(path, edition)
      .showEditorsPicks(true)
      .pageSize(20)
      .response.map{ response: ItemResponse =>

      val tag = response.tag map { new Tag(_) }

      val leadContentCutOff = DateTime.now - leadContentMaxAge
      val editorsPicks: Seq[Content] = response.editorsPicks.map(Content(_))

      val leadContent: Seq[Content] = if (editorsPicks.isEmpty)
        response.leadContent.take(1).map {Content(_) }.filter(_.webPublicationDate > leadContentCutOff)
      else
        Nil

      val latest: Seq[Content] = response.results.map(Content(_)).filterNot(c => leadContent.map(_.id).exists(_ == c.id))

      val allTrails = (editorsPicks ++ latest).distinctBy(_.id).take(20)

      val model = tag map { TagAndTrails(_, allTrails, leadContent) }
      ModelOrResult(model, response)

    }.recover{suppressApiNotFound}
  }

  private def renderTag(model: TagAndTrails)(implicit request: RequestHeader) = {
    Cached(model.tag){
      if (request.isJson)
        JsonComponent(
          "html" -> views.html.fragments.tagBody(model.tag, model.trails, model.leadContent),
          "trails" -> (model.leadContent ++ model.trails).map(_.url),
          "config" -> Json.parse(views.html.fragments.javaScriptConfig(model.tag, Switches.all).body)
        )
      else
        Ok(views.html.tag(model.tag, model.trails, model.leadContent))
    }
  }
  
  private def renderTrailsFragment(model: TagAndTrails)(implicit request: RequestHeader) = {
    val response = () => views.html.fragments.trailblocks.headline(model.trails, numItemsVisible = model.trails.size)
    renderFormat(response, response, model.tag)
  }
  
}