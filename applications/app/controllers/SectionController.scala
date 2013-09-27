package controllers

import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.libs.json._


case class SectionFrontPage(section: Section, editorsPicks: Seq[Trail], latestContent: Seq[Trail])

object SectionController extends Controller with Logging with Paging with JsonTrails with ExecutionContexts {

  def renderJson(path: String) = render(path)
  def render(path: String) = Action.async { implicit request =>
    lookup(path) map {
      case Left(model) => renderSectionFront(model)
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
    log.info(s"Fetching front: $path for edition $edition")

    ContentApi.item(path, edition)
      .pageSize(20)
      .showEditorsPicks(true)
      .response.map {response =>
        val section = response.section map { Section(_) }
        val editorsPicks = response.editorsPicks map { Content(_) }
        val editorsPicksIds = editorsPicks map { _.id }
        val latestContent = response.results map { Content(_) } filterNot { c => editorsPicksIds contains (c.id) }
        val model = section map { SectionFrontPage(_, editorsPicks, latestContent) }
        ModelOrResult(model, response)
    }.recover{suppressApiNotFound}
  }

  private def renderSectionFront(model: SectionFrontPage)(implicit request: RequestHeader) = {
    val numTrails = math.max(model.editorsPicks.length, 15)
    val trails = (model.editorsPicks ++ model.latestContent).take(numTrails)
    Cached(model.section){
      if (request.isJson)
        JsonComponent(
          "html" -> views.html.fragments.sectionBody(model.section, trails),
          "trails" -> trails.map(_.url),
          "config" -> Json.parse(views.html.fragments.javaScriptConfig(model.section, Switches.all).body)
        )
      else
        Ok(views.html.section(model.section, trails))
    }
  }
  
  private def renderTrailsFragment(model: SectionFrontPage)(implicit request: RequestHeader) = {
    val trails: Seq[Trail] = model.editorsPicks ++ model.latestContent
    val response = () => views.html.fragments.trailblocks.headline(trails, numItemsVisible = trails.size)
    renderFormat(response, response, model.section)
  }
  
}
