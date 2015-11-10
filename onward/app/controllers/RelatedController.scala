package controllers


import common._
import containers.Containers
import model._
import play.api.mvc.{Result, RequestHeader, Controller}
import play.twirl.api.Html
import services._
import performance.MemcachedAction
import views.support.LinkInfo
import scala.concurrent.duration._

object RelatedController extends Controller with Related with Containers with Logging with ExecutionContexts {

  private val page = new Page(
    "related-content",
    "related-content",
    "Related content",
    "GFE:Related content"
  )

  def renderHtml(path: String) = render(path)

  def render(path: String) = MemcachedAction { implicit request =>
    renderUsingCallback(trails => renderRelated(trails.sortBy(-_.webPublicationDate.getMillis)), path)
  }

  private def renderRelated(trails: Seq[Content])(implicit request: RequestHeader) = Cached(30.minutes) {
    val relatedTrails = trails map FaciaContentConvert.frontendContentToFaciaContent take 8

    if (request.isJson) {
      val html = views.html.fragments.containers.facia_cards.container(
        onwardContainer("related content", relatedTrails),
        FrontProperties.empty
      )(request)
      JsonComponent("html" -> html)
    } else {
      Ok(views.html.relatedContent(page, relatedTrails))
    }
  }

  def renderLinks(path: String) = MemcachedAction { implicit request =>
    renderUsingCallback(trails => Cached(30.minutes)(JsonComponent("html" -> views.html.fragments.inbody.linkList(linkInfo(trails.take(4)), true, "internal"))), path)
  }

  def linkInfo(trails: Seq[Content]) =
    trails.map { trail =>
      LinkInfo(None, trail.webPublicationDate.getMillis, None, trail.webUrl, trail.headline)
    }

  def renderUsingCallback(renderCallback: Seq[Content] => Result, path: String)(implicit request: RequestHeader) = {
    val edition = Edition(request)
    val excludeTags = request.queryString.getOrElse("exclude-tag", Nil)
    related(edition, path, excludeTags) map {
      case Nil => JsonNotFound()
      case trails => renderCallback(trails)
    }
  }

}
