package controllers

import com.gu.contentapi.client.GuardianContentApiError
import com.gu.facia.api.models.FaciaContent
import common._
import conf.LiveContentApi.getResponse
import conf._
import model._
import model.pressed.PressedContent
import play.api.mvc.{Action, Controller, RequestHeader}

import scala.concurrent.Future

object TopStoriesController extends Controller with Logging with Paging with ExecutionContexts {

  def renderTopStoriesHtml = renderTopStories()
  def renderTopStories() = Action.async { implicit request =>
    val response = lookup(Edition(request)) map { topStories =>
      topStories map { stories => renderTopStoriesPage(stories.faciaItems) }
    }

    response map { _ getOrElse NotFound }
  }

  def renderTrails() = Action.async { implicit request =>
    val response = lookup(Edition(request)) map { topStories =>
      topStories map { stories => renderTopStoriesTrails(stories.faciaItems) }
    }

    response map { _ getOrElse NotFound }
  }

  private def lookup(edition: Edition)(implicit request: RequestHeader): Future[Option[RelatedContent]] = {
    log.info(s"Fetching top stories for edition ${edition.id}")
    getResponse(LiveContentApi.item("/", edition)
      .showEditorsPicks(true)
    ).map { response =>
        response.editorsPicks map { item =>
          RelatedContentItem(item)
        } match {
          case Nil => None
          case picks => Some(RelatedContent(picks))
        }
      } recover { case GuardianContentApiError(404, message, _) =>
        log.info(s"Got a 404 while calling content api: $message")
        None
      }
  }

  private def renderTopStoriesPage(trails: Seq[PressedContent])(implicit request: RequestHeader) = {
    val page = SimplePage( MetaData.make(
      "top-stories",
      "top-stories",
      "Top Stories",
      "GFE:Top Stories"
    ))

    val htmlResponse = () => views.html.topStories(page, trails)
    val jsonResponse = () => views.html.fragments.topStoriesBody(trails)

    Cached(900) {
      if (request.isJson)
        JsonComponent(
          "html" -> jsonResponse()
        )
      else
        Ok(htmlResponse())
    }
  }

  private def renderTopStoriesTrails(trails: Seq[PressedContent])(implicit request: RequestHeader) = {
    val trailsLength = request.getQueryString("page-size").map{ _.toInt }.getOrElse(trails.size)
    val response = if (request.getQueryString("view") == Some("link"))
      () => views.html.fragments.trailblocks.link(trails, trailsLength)
    else
      () => views.html.fragments.trailblocks.headline(trails, trailsLength)

    renderFormat(response, response, 900)
  }
}
