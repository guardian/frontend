package controllers

import com.gu.contentapi.client.model.ContentApiError
import common._
import contentapi.ContentApiClient
import model.Cached.RevalidatableResult
import model._
import model.pressed.PressedContent
import play.api.mvc._
import play.twirl.api.Html

import scala.concurrent.Future

class TopStoriesController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with Paging
    with ImplicitControllerExecutionContext {

  def renderTopStoriesHtml: Action[AnyContent] = renderTopStories()
  def renderTopStories(): Action[AnyContent] =
    Action.async { implicit request =>
      val response = lookup(Edition(request)) map { topStories =>
        topStories map { stories => renderTopStoriesPage(stories.faciaItems) }
      }

      response map { _ getOrElse NotFound }
    }

  def renderTrails(): Action[AnyContent] =
    Action.async { implicit request =>
      val response = lookup(Edition(request)) map { topStories =>
        topStories map { stories => renderTopStoriesTrails(stories.faciaItems) }
      }

      response map { _ getOrElse NotFound }
    }

  private def lookup(edition: Edition)(implicit request: RequestHeader): Future[Option[RelatedContent]] = {
    logDebugWithRequestId(s"Fetching top stories for edition ${edition.id}")
    contentApiClient
      .getResponse(
        contentApiClient
          .item("/", edition)
          .showEditorsPicks(true),
      )
      .map { response =>
        response.editorsPicks.getOrElse(Seq.empty).toList map { item =>
          RelatedContentItem(item)
        } match {
          case Nil   => None
          case picks => Some(RelatedContent(picks))
        }
      } recover { case ContentApiError(404, message, _) =>
      logDebugWithRequestId(s"Got a 404 while calling content api: $message")
      None
    }
  }

  private def renderTopStoriesPage(trails: Seq[PressedContent])(implicit request: RequestHeader): Result = {
    val page = SimplePage(
      MetaData.make(
        "top-stories",
        Some(SectionId.fromId("top-stories")),
        "Top Stories",
      ),
    )

    val htmlResponse: () => Html = () => views.html.topStories(page, trails)
    val jsonResponse: () => Html = () => views.html.fragments.topStoriesBody(trails)

    Cached(900) {
      if (request.isJson)
        JsonComponent(jsonResponse())
      else
        RevalidatableResult.Ok(htmlResponse())
    }
  }

  private def renderTopStoriesTrails(trails: Seq[PressedContent])(implicit request: RequestHeader): Result = {
    val trailsLength = request.getQueryString("page-size").map { _.toInt }.getOrElse(trails.size)
    val response =
      if (request.getQueryString("view").contains("link"))
        () => views.html.fragments.trailblocks.link(trails, trailsLength)
      else
        () => views.html.fragments.trailblocks.headline(trails, trailsLength)

    renderFormat(response, response, 900)
  }
}
