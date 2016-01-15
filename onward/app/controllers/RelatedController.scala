package controllers


import common._
import containers.Containers
import model._
import play.api.libs.json._
import play.api.mvc.{ RequestHeader, Controller }
import services._
import performance.MemcachedAction
import views.support.FaciaToMicroFormat2Helpers.isCuratedContent
import scala.concurrent.duration._

object RelatedController extends Controller with Related with Containers with Logging with ExecutionContexts {

  private val page = SimplePage(MetaData.make(
    "related-content",
    "related-content",
    "Related content",
    "GFE:Related content")
  )

  def renderHtml(path: String) = render(path)
  def renderMf2(path: String) = render(path, true)
  def render(path: String, isMf2: Boolean = false) = MemcachedAction { implicit request =>
    val edition = Edition(request)
    val excludeTags = request.queryString.getOrElse("exclude-tag", Nil)
    val relatedType = request.queryString.getOrElse("related-type", Nil)
    related(edition, path, excludeTags, relatedType) map {
      case related if related.items.isEmpty => JsonNotFound()
      case related if isMf2 => renderRelatedMf2(related.items.sortBy(-_.content.trail.webPublicationDate.getMillis), "related content")
      case trails => renderRelated(trails.items.sortBy(-_.content.trail.webPublicationDate.getMillis))
    }
  }

  private def renderRelated(trails: Seq[RelatedContentItem])(implicit request: RequestHeader) = Cached(30.minutes) {
    val relatedTrails = trails take 8

    if (request.isJson) {
      val html = views.html.fragments.containers.facia_cards.container(
        onwardContainer("related content", relatedTrails.map(_.faciaContent)),
        FrontProperties.empty
      )(request)
      JsonComponent("html" -> html)
    } else {
      Ok(views.html.relatedContent(page, relatedTrails.map(_.faciaContent)))
    }
  }

  private def renderRelatedMf2(trails: Seq[RelatedContentItem], title: String)(implicit request: RequestHeader) = Cached(30.minutes) {
    val relatedTrails = trails take 8

    JsonComponent(
      "items" -> JsArray(Seq(
        Json.obj(
          "displayName" -> "related content",
          "showContent" -> relatedTrails.nonEmpty,
          "content" -> relatedTrails.map( collection => isCuratedContent(collection.faciaContent))
        )
      ))
    )
  }
}
