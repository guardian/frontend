package controllers

import common._
import containers.Containers
import contentapi.ContentApiClient
import feed.MostReadAgent
import model.Cached.RevalidatableResult
import model._
import play.api.libs.json._
import play.api.mvc.{Action, Controller, RequestHeader}
import services._
import views.support.FaciaToMicroFormat2Helpers.isCuratedContent

import scala.concurrent.duration._

class RelatedController(val contentApiClient: ContentApiClient, val mostReadAgent: MostReadAgent) extends Controller with Related with Containers with Logging with ExecutionContexts {

  private val page = SimplePage(MetaData.make(
    "related-content",
    Some(SectionSummary.fromId("related-content")),
    "Related content",
    "GFE:Related content")
  )

  def renderHtml(path: String) = render(path)
  def renderMf2(path: String) = render(path, true)
  def render(path: String, isMf2: Boolean = false) = Action.async { implicit request =>
    val edition = Edition(request)
    val excludeTags = request.queryString.getOrElse("exclude-tag", Nil)

    related(edition, path, excludeTags) map {
      case related if related.items.isEmpty => Cached(60)(JsonNotFound())
      case related if isMf2 => renderRelatedMf2(related.items.sortBy(-_.content.trail.webPublicationDate.getMillis), "related content")
      case trails => renderRelated(trails.items.sortBy(-_.content.trail.webPublicationDate.getMillis), containerTitle = "related content")
    }
  }

  private def renderRelated(trails: Seq[RelatedContentItem], containerTitle: String)(implicit request: RequestHeader) = Cached(30.minutes) {
    val relatedTrails = trails take 8

    if (request.isJson) {
      val html = views.html.fragments.containers.facia_cards.container(
        onwardContainer(containerTitle, relatedTrails.map(_.faciaContent)),
        FrontProperties.empty
      )(request)
      JsonComponent(html)
    } else {
      RevalidatableResult.Ok(views.html.relatedContent(page, relatedTrails.map(_.faciaContent)))
    }
  }

  private def renderRelatedMf2(trails: Seq[RelatedContentItem], title: String)(implicit request: RequestHeader) = Cached(30.minutes) {
    val relatedTrails = trails take 4

    JsonComponent(
      "items" -> JsArray(Seq(
        Json.obj(
          "displayName" -> "related content",
          "showContent" -> (!relatedTrails.isEmpty),
          "content" -> relatedTrails.map( collection => isCuratedContent(collection.faciaContent))
        )
      ))
    )
  }
}
