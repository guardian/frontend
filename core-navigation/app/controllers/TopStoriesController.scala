package controllers

import common._
import com.gu.openplatform.contentapi.ApiError
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import scala.concurrent.Future
import com.gu.openplatform.contentapi.ApiError
import play.api.libs.json.JsArray

object TopStoriesController extends Controller with Logging with Paging with JsonTrails with ExecutionContexts {

  val validFormats: Seq[String] = Seq("html", "json")

  def renderTopStoriesJson() = renderTopStories()
  def renderTopStories() = Action.async { implicit request =>
    val response = lookup(Edition(request)) map { topStories =>
      topStories map { renderTopStoriesPage(_) }
    }

    response map { _ getOrElse NotFound }
  }

  def renderJsonTrails() = renderTrails()
  def renderTrails() = Action.async { implicit request =>
    val response = lookup(Edition(request)) map { topStories =>
      topStories map { renderTopStoriesTrails(_) }
    }

    response map { _ getOrElse NotFound }
  }

  private def lookup(edition: Edition)(implicit request: RequestHeader): Future[Option[Seq[Content]]] = {
    log.info(s"Fetching top stories for edition ${edition.id}")
    ContentApi.item("/", edition)
      .showEditorsPicks(true)
      .response
      .map { response =>
        response.editorsPicks map { Content(_) } match {
          case Nil => None
          case picks => Some(picks)
        }
      }.recover{case ApiError(404, message) =>
        log.info(s"Got a 404 while calling content api: $message")
        None
      }
  }

  private def renderTopStoriesPage(trails: Seq[Trail])(implicit request: RequestHeader) = {
    val page = new Page(
      "top-stories",
      "top-stories",
      "Top Stories",
      "GFE:Top Stories"
    )

    val htmlResponse = () => views.html.topStories(page, trails)
    val jsonResponse = () => views.html.fragments.topStoriesBody(trails)

    Cached(900) {
      if (request.isJson)
        JsonComponent(
          "html" -> jsonResponse(),
          "trails" -> JsArray(trails.map(TrailToJson(_)))
        )
      else
        Ok(htmlResponse())
    }
  }

  private def renderTopStoriesTrails(trails: Seq[Trail])(implicit request: RequestHeader) = {
    val trailsLength = request.getQueryString("page-size").map{ _.toInt }.getOrElse(trails.size)
    val response = if (request.getQueryString("view") == Some("link")) 
      () => views.html.fragments.trailblocks.link(trails, trailsLength)
    else
      () => views.html.fragments.trailblocks.headline(trails, trailsLength)
      
    renderFormat(response, response, 900)
  }
}