package controllers

import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }

case class GalleryPage(
  gallery: Gallery,
  storyPackage: List[Trail],
  index: Int,
  trail: Boolean)

object GalleryController extends Controller with Logging with ExecutionContexts {

  def renderJson(path: String) = render(path)
  def render(path: String) = Action.async { implicit request =>
    val index = request.getQueryString("index") map (_.toInt) getOrElse 1
    val isTrail = request.getQueryString("trail") map (_.toBoolean) getOrElse false

    lookup(path, index, isTrail) map {
      case Left(model) if model.gallery.isExpired => Gone(views.html.expired(model.gallery))
      case Left(model) => renderGallery(model)
      case Right(notFound) => notFound
    }
  }

  def renderLightbox(path: String) = Action.async { implicit request =>
    val index = request.getQueryString("index") map (_.toInt) getOrElse 1
    val isTrail = request.getQueryString("trail") map (_.toBoolean) getOrElse false

    lookup(path, index, isTrail) map {
      case Left(model) if model.gallery.isExpired => Gone(views.html.expired(model.gallery))
      case Left(model) => renderLightboxGallery(model)
      case Right(notFound) => notFound
    }
  }

  private def lookup(path: String, index: Int, isTrail: Boolean)(implicit request: RequestHeader) =  {
    val edition = Edition(request)
    log.info(s"Fetching gallery: $path for edition $edition")
    ContentApi.item(path, edition)
      .showExpired(true)
      .showFields("all")
      .showMedia("picture") // TODO remove after content api team have properly ordered elements
      .response.map{response =>
        val gallery = response.content.filter { _.isGallery } map { new Gallery(_) }
        val storyPackage = response.storyPackage map { Content(_) }

        val model = gallery map { g => GalleryPage(g, storyPackage.filterNot(_.id == g.id), index, isTrail) }
        ModelOrResult(model, response)
    }.recover{suppressApiNotFound}
  }

  private def renderGallery(model: GalleryPage)(implicit request: RequestHeader) = {
    val htmlResponse = () => views.html.gallery(model.gallery, model.storyPackage, model.index, model.trail)
    val jsonResponse = () => views.html.fragments.galleryBody(model.gallery, model.storyPackage, model.index, model.trail)
    renderFormat(htmlResponse, jsonResponse, model.gallery, Switches.all)
  }

  private def renderLightboxGallery(model: GalleryPage)(implicit request: RequestHeader) = {
    val response = () => views.html.fragments.lightboxGalleryBody(model.gallery, model.storyPackage, model.index, model.trail)
    renderFormat(response, response, model.gallery, Switches.all)
  }
}
