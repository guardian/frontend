package controllers

import common._
import containers.Containers
import contentapi.ContentApiClient
import feed.MostReadAgent
import model.Cached.RevalidatableResult
import model._
import model.dotcomrendering.{Trail, OnwardCollectionResponse}
import play.api.libs.json._
import play.api.mvc._
import services._
import views.support.FaciaToMicroFormat2Helpers.isCuratedContent

import scala.concurrent.duration._

class RelatedController(
    val contentApiClient: ContentApiClient,
    val mostReadAgent: MostReadAgent,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with Related
    with Containers
    with GuLogging
    with ImplicitControllerExecutionContext {

  private val RelatedLabel: String = "Related stories"

  private val page = SimplePage(
    MetaData.make("related-content", Some(SectionId.fromId("related-content")), RelatedLabel),
  )

  def renderHtml(path: String): Action[AnyContent] = render(path)
  def renderMf2(path: String): Action[AnyContent] = render(path, true)
  def render(path: String, isMf2: Boolean = false): Action[AnyContent] =
    Action.async { implicit request =>
      val edition = Edition(request)
      val excludeTags = request.queryString.getOrElse("exclude-tag", Nil)

      related(edition, path, excludeTags) map {
        case related if related.items.isEmpty => Cached(60)(JsonNotFound())
        case related if isMf2 =>
          renderRelatedMf2(related.items.sortBy(-_.content.trail.webPublicationDate.getMillis), RelatedLabel)
        case trails =>
          renderRelated(
            trails.items.sortBy(-_.content.trail.webPublicationDate.getMillis),
            containerTitle = RelatedLabel,
          )
      }
    }

  private def renderRelated(trails: Seq[RelatedContentItem], containerTitle: String)(implicit
      request: RequestHeader,
  ): Result =
    Cached(30.minutes) {
      val relatedTrails = trails take 8

      if (request.forceDCR) {
        val data = OnwardCollectionResponse(
          heading = containerTitle,
          trails = trails.map(_.faciaContent).map(Trail.pressedContentToTrail).take(10),
        )

        JsonComponent.fromWritable(data)
      } else if (request.isJson) {
        val html = views.html.fragments.containers.facia_cards.container(
          onwardContainer(containerTitle, relatedTrails.map(_.faciaContent)),
          FrontProperties.empty,
        )
        JsonComponent(html)
      } else {
        RevalidatableResult.Ok(views.html.relatedContent(page, relatedTrails.map(_.faciaContent)))
      }
    }

  private def renderRelatedMf2(trails: Seq[RelatedContentItem], title: String)(implicit
      request: RequestHeader,
  ): Result =
    Cached(30.minutes) {
      val relatedTrails = trails take 4

      JsonComponent(
        "items" -> JsArray(
          Seq(
            Json.obj(
              "displayName" -> RelatedLabel,
              "showContent" -> relatedTrails.nonEmpty,
              "content" -> relatedTrails.map(collection => isCuratedContent(collection.faciaContent)),
            ),
          ),
        ),
      )
    }
}
