package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import conf._
import common.{ Configuration => UnWanted, _ }
import play.api.mvc.{ RequestHeader, Controller, Action }
import org.joda.time.DateTime
import org.scala_tools.time.Implicits._

case class TagAndTrails(tag: Tag, trails: Seq[Trail], leadContent: Seq[Trail])

object TagController extends Controller with Logging {
  def render(path: String) = Action { implicit request =>
    lookup(path) map { renderTag } getOrElse { NotFound }
  }

  private def lookup(path: String)(implicit request: RequestHeader): Option[TagAndTrails] = suppressApi404 {
    val edition = Edition(request, Configuration)
    log.info("Fetching tag: " + path + " for edition " + edition)
    val response: ItemResponse = ContentApi.item
      .edition(edition)
      .showTags("all")
      .showFields("all")
      .showMedia("all")
      .itemId(path)
      .response

    val tag = response.tag map { new Tag(_) }
    val trails = response.results map { new Content(_) }
    val leadContentCutOff = DateTime.now - 7.days
    val leadContent = response.leadContent map { new Content(_) } filter (_.webPublicationDate > leadContentCutOff)

    tag map { TagAndTrails(_, trails, leadContent) }
  }

  private def renderTag(model: TagAndTrails)(implicit request: RequestHeader) = CachedOk(model.tag) {
    Compressed(views.html.tag(model.tag, model.trails, model.leadContent))
  }
}