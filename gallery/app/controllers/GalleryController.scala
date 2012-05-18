package controllers

import conf._
import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import play.api.mvc.{ Controller, Action }

case class GalleryPage(
  gallery: Gallery,
  related: List[Trail],
  storyPackage: List[Trail],
  index: Int = 1,
  trail: Boolean = false)

object GalleryController extends Controller with Logging {

  def render(path: String) = Action { request =>
    val page = lookup(path) map {
      _.copy(
        index = request.queryString.get("index") flatMap { _.head.toIntOption } getOrElse 1,
        trail = request.queryString.get("trail") flatMap { _.head.toBooleanOption } getOrElse false
      )
    }

    page map { renderGallery } getOrElse { NotFound }
  }

  private def lookup(path: String): Option[GalleryPage] = suppressApi404 {
    log.info("Fetching gallery: " + path)
    val response: ItemResponse = ContentApi.item
      .showTags("all")
      .showFields("all")
      .showMedia("all")
      .showRelated(true)
      .showStoryPackage(true)
      .itemId(path)
      .response

    val gallery = response.content.filter { _.isGallery } map { new Gallery(_) }
    val related = response.relatedContent map { new Content(_) }
    val storyPackage = response.storyPackage map { new Content(_) }

    gallery map { GalleryPage(_, related, storyPackage) }
  }

  private def renderGallery(model: GalleryPage) =
    Ok(views.html.gallery(model.gallery, model.related, model.storyPackage, model.index, model.trail))
}
