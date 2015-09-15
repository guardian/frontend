package controllers

import com.gu.contentapi.client.model.{Content => ApiContent, ItemResponse}
import common._
import conf.Configuration.commercial.expiredAdFeatureUrl
import conf.LiveContentApi.getResponse
import conf._
import model._
import play.api.mvc._
import play.twirl.api.Html
import views.support.RenderOtherStatus

import scala.concurrent.Future

case class GalleryPage(
  gallery: Gallery,
  related: RelatedContent,
  index: Int,
  trail: Boolean)

object GalleryController extends Controller with RendersItemResponse with Logging with ExecutionContexts {

  def renderJson(path: String) = render(path)
  def render(path: String) = Action.async { implicit request => renderItem(path) }

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = {
    val index = request.getIntParameter("index") getOrElse 1
    val isTrail = request.getBooleanParameter("trail") getOrElse false

    lookup(path, index, isTrail) map {
      case Left(model) if model.gallery.isExpired => RenderOtherStatus(Gone) // TODO - delete this line after switching to new content api
      case Left(model) => renderGallery(model)
      case Right(other) => RenderOtherStatus(other)
    }
  }

  def lightboxJson(path: String) = Action.async { implicit request =>
    val index = request.getIntParameter("index") getOrElse 1
    lookup(path, index, isTrail=false) map {
      case Right(other) => RenderOtherStatus(other)
      case Left(model) => Cached(model.gallery) { JsonComponent(model.gallery.lightbox) }
    }
  }

  private def lookup(path: String, index: Int, isTrail: Boolean)(implicit request: RequestHeader) =  {
    val edition = Edition(request)
    log.info(s"Fetching gallery: $path for edition $edition")
    getResponse(LiveContentApi.item(path, edition)
      .showFields("all")
    ).map{response =>
        val gallery = response.content.filter(isSupported).map(Gallery(_))
        val model = gallery map { g => GalleryPage(g, RelatedContent(g, response), index, isTrail) }

      if (gallery.exists(_.isExpiredAdvertisementFeature)) {
        Right(MovedPermanently(expiredAdFeatureUrl))
      } else {
        ModelOrResult(model, response)
      }

    }.recover{convertApiExceptions}
  }

  private def renderGallery(model: GalleryPage)(implicit request: RequestHeader) = {
    val htmlResponse: (() => Html) = () =>
      if (request.isAmp) views.html.galleryAMP(model.gallery, model.related, model.index)
      else views.html.gallery(model.gallery, model.related, model.index)
    val jsonResponse = () => views.html.fragments.galleryBody(model.gallery, model.related, model.index)
    renderFormat(htmlResponse, jsonResponse, model.gallery, Switches.all)
  }

  private def isSupported(c: ApiContent) = c.isGallery
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
}
