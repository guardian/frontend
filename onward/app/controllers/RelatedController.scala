package controllers


import com.gu.facia.api.models.{CuratedContent, FaciaContent}
import implicits.FaciaContentImplicits._
import common._
import containers.Containers
import model._
import play.api.libs.json._
import play.api.mvc.{ RequestHeader, Controller }
import services._
import performance.MemcachedAction
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
    related(edition, path, excludeTags) map {
      case related if related.items.isEmpty => JsonNotFound()
      case stories if isMf2 => renderRelatedMf2(stories.items.sortBy(-_.content.trail.webPublicationDate.getMillis), "related content")
      case trails => renderRelated(trails.items.sortBy(-_.content.trail.webPublicationDate.getMillis), "related content")
    }
  }

  /*
  give the first 2 from each tag excluding the current article
   */
  def renderTags(path: String) = MemcachedAction { implicit request =>
    val edition = Edition(request)
    val keywordIds = request.queryString.getOrElse("keywordIds", Nil).flatMap(_.split(","))

    getRelatedByTags(edition, path, keywordIds) map {
      case related if related.items.isEmpty => JsonNotFound()
      case trails => renderRelated(trails.items.sortBy(-_.content.trail.webPublicationDate.getMillis), "further reading")
    }
  }

  private def renderRelated(trails: Seq[RelatedContentItem], title: String)(implicit request: RequestHeader) = Cached(30.minutes) {
    val relatedTrails = trails take 8

    if (request.isJson) {
      val html = views.html.fragments.containers.facia_cards.container(
        onwardContainer(title, relatedTrails.map(_.faciaContent)),
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
      "items" -> JsArray(trails.map( collection => isCuratedContent(collection.faciaContent)))
    )
  }

  private def isCuratedContent(content: FaciaContent): JsValue = content match {
    case c: CuratedContent => getContent(c)
    case _ => Json.obj()
  }

  private def getContent(content: CuratedContent): JsValue = {
    JsObject(
      Json.obj(
        "headline" -> content.headline,
        "trailText" -> content.trailText,
        "href" -> content.href,
        "thumbnail" -> content.maybeContent.flatMap(_.safeFields.get("thumbnail")),
        "id" -> content.maybeContent.map(_.id),
        "frontPublicationDate" -> content.maybeFrontPublicationDate
      )
      .fields
      .filterNot{ case (_, v) => v == JsNull}
    )
  }
}
