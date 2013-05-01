package controllers

import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.libs.concurrent.Execution.Implicits._
import com.gu.openplatform.contentapi.ApiError

object TopStoriesController extends Controller with Logging with Paging with JsonTrails {

  val validFormats: Seq[String] = Seq("html", "json")

  def render() = Action { implicit request =>
    val edition = Edition(request)
    val promiseOfTopStories = lookup(edition)
    Async {
      promiseOfTopStories.map(_.map { renderTopStories(_) } getOrElse { NotFound })
    }
  }

  def renderTrails() = Action { implicit request =>
    val edition = Edition(request)
    val promiseOfTopStories = lookup(edition)
    Async {
      promiseOfTopStories.map(_.map { renderTopStoriesTrails(_) } getOrElse { NotFound })
    }
  }

  private def lookup(edition: Edition)(implicit request: RequestHeader) = {
    log.info(s"Fetching top stories for edition ${edition.id}")
    ContentApi.item("/", edition)
      .showEditorsPicks(true)
      .response
      .map {response =>
        SupportedContentFilter(response.editorsPicks map { new Content(_) }) match {
          case Nil => None
          case picks => Some(picks)
        }
      }.recover{case ApiError(404, message) =>
        log.info(s"Got a 404 while calling content api: $message")
        None
      }
  }

  private def renderTopStories(trails: Seq[Trail])(implicit request: RequestHeader) = {
    val page = new Page(
      Some("http://www.guardian.co.uk/"),
      "top-stories",
      "top-stories",
      "Top Stories",
      "GFE:Top Stories"
    )
    val htmlResponse = views.html.topStories(page, trails)
    val jsonResponse = views.html.fragments.topStoriesBody(trails)
    renderFormat(htmlResponse, jsonResponse, 900)
  }

  private def renderTopStoriesTrails(trails: Seq[Trail])(implicit request: RequestHeader) = {
    val trailsLength = request.getQueryString("page-size").map{ _.toInt }.getOrElse(trails.size)
    val response = if (request.getQueryString("view") == Some("link")) 
      views.html.fragments.trailblocks.link(trails, trailsLength)
    else
      views.html.fragments.trailblocks.headline(trails, trailsLength)
      
    renderFormat(response, response, 900)
  }
}