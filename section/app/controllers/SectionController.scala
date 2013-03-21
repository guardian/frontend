package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.libs.concurrent.Execution.Implicits._
import concurrent.Future


case class SectionFrontPage(section: Section, editorsPicks: Seq[Trail], latestContent: Seq[Trail])

object SectionController extends Controller with Logging with Paging with JsonTrails {

  def render(path: String) = Action { implicit request =>
    val promiseOfSection = lookup(path)
    Async {
      promiseOfSection.map {
        case Left(model) => renderSectionFront(model, "html")
        case Right(notFound) => notFound
      }
    }
  }

  def renderJson(path: String) = Action { implicit request =>
    val promiseOfSection = lookup(path)
    Async {
      promiseOfSection.map {
        case Left(model) => renderSectionFront(model, "json")
        case Right(_) => NotFound //do not redirect json
      }
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader) = {
    val edition = Site(request).edition
    log.info(s"Fetching front: $path for edition $edition")

    ContentApi.item(path, edition)
      .pageSize(20)
      .showEditorsPicks(true)
      .response.map {response =>
        val section = response.section map { Section(_) }
        val editorsPicks = response.editorsPicks map { new Content(_) }
        val editorsPicksIds = editorsPicks map { _.id }
        val latestContent = response.results map { new Content(_) } filterNot { c => editorsPicksIds contains (c.id) }
        val model = section map { SectionFrontPage(_, editorsPicks, latestContent) }
        ModelOrResult(model, response)
    }.recover{suppressApiNotFound}
  }

  private def renderSectionFront(model: SectionFrontPage, format: String)(implicit request: RequestHeader) = Cached(model.section) {
    if (format == "json") {
      renderJsonTrails(model.editorsPicks ++ model.latestContent)
    } else {
      Ok(Compressed(views.html.section(model.section, model.editorsPicks, model.latestContent)))
    }
  }
}
