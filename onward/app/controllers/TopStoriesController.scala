package controllers

import com.gu.contentapi.client.GuardianContentApiError
import common._
import contentapi.ContentApiClient
import model.Cached.RevalidatableResult
import model._
import model.pressed.PressedContent
import play.api.mvc.{Action, Controller, RequestHeader}
import play.twirl.api.Html

import scala.concurrent.Future

class TopStoriesController(contentApiClient: ContentApiClient) extends Controller with Logging with Paging with ExecutionContexts {

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
    contentApiClient.getResponse(contentApiClient.item("/", edition)
      .showEditorsPicks(true)
    ).map { response =>
        response.editorsPicks.getOrElse(Seq.empty).toList map { item =>
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
      Some(SectionSummary.fromId("top-stories")),
      "Top Stories",
      "GFE:Top Stories"
    ))

    val htmlResponse: () => Html = () => views.html.topStories(page, trails)
    val jsonResponse: () => Html = () => views.html.fragments.topStoriesBody(trails)

    Cached(900) {
      if (request.isJson)
        JsonComponent(jsonResponse())
      else
        RevalidatableResult.Ok(htmlResponse())
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
