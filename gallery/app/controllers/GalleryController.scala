package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.libs.concurrent.Akka
import play.api.Play.current

case class GalleryPage(
  gallery: Gallery,
  storyPackage: List[Trail],
  index: Int,
  trail: Boolean)

object GalleryController extends Controller with Logging with implicits.Requests {

  def render(path: String) = Action { implicit request =>

    val index = request.getParameter("index") map (_.toInt) getOrElse 1
    val isTrail = request.getParameter("trail") map (_.toBoolean) getOrElse false

    val promiseOfGalleryPage = Akka.future(lookup(path, index, isTrail))

    Async {
      promiseOfGalleryPage.map(_.map { renderGallery } getOrElse { NotFound })
    }
  }

  private def lookup(path: String, index: Int, isTrail: Boolean)(implicit request: RequestHeader): Option[GalleryPage] = suppressApi404 {
    val edition = Edition(request, Configuration)
    log.info("Fetching gallery: " + path + " for edition " + edition)
    val response: ItemResponse = ContentApi.item(path, edition)
      .showFields("all")
      .response

    val gallery = response.content.filter { _.isGallery } map { new Gallery(_) }
    val storyPackage = response.storyPackage map { new Content(_) }

    gallery map { g => GalleryPage(g, storyPackage.filterNot(_.id == g.id), index, isTrail) }
  }

  private def renderGallery(model: GalleryPage)(implicit request: RequestHeader) =
    Cached(model.gallery) {
      Ok(Compressed(views.html.gallery(model.gallery, model.storyPackage, model.index, model.trail)))
    }
}
