package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import conf._
import common._
import play.api.mvc.{ Controller, Action }

case class TagAndTrails(tag: Tag, trails: List[Trail])

object TagController extends Controller with Logging {
  def render(path: String) = Action {
    lookup(path) map { renderTag } getOrElse { NotFound }
  }

  private def lookup(path: String): Option[TagAndTrails] = suppressApi404 {
    log.info("Fetching tag: " + path)
    val response: ItemResponse = ContentApi.item
      .showTags("all")
      .showFields("all")
      .showMedia("all")
      .itemId(path)
      .response

    val tag = response.tag map { new Tag(_) }
    val trails = response.results map { new Content(_) }

    tag map { TagAndTrails(_, trails) }
  }

  private def renderTag(model: TagAndTrails) = Ok(views.html.tag(model.tag, model.trails))
}