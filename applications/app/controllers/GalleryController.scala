package controllers

import com.gu.contentapi.client.model.v1.{Content => ApiContent, ItemResponse}
import common._
import conf.switches.Switches
import contentapi.ContentApiClient
import model._
import play.api.mvc._
import play.twirl.api.Html
import views.support.RenderOtherStatus

import scala.concurrent.Future

object GalleryController extends Controller with RendersItemResponse with Logging with ExecutionContexts {

  def renderJson(path: String) = render(path)
  def render(path: String) = Action.async { implicit request => renderItem(path) }

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = {
    val index = request.getIntParameter("index") getOrElse 1
    val isTrail = request.getBooleanParameter("trail") getOrElse false

    lookup(path, index, isTrail) map {
      case Left(model) if model.gallery.content.isExpired => RenderOtherStatus(Gone) // TODO - delete this line after switching to new content api
      case Left(model) => renderGallery(model)
      case Right(other) => RenderOtherStatus(other)
    }
  }

  def lightboxJson(path: String) = Action.async { implicit request =>
    val index = request.getIntParameter("index") getOrElse 1
    lookup(path, index, isTrail=false) map {
      case Right(other) => RenderOtherStatus(other)
      case Left(model) => Cached(model) { JsonComponent(model.gallery.lightbox.javascriptConfig) }
    }
  }

  private def lookup(path: String, index: Int, isTrail: Boolean)
                    (implicit request: RequestHeader) = {
    val edition = Edition(request)
    log.info(s"Fetching gallery: $path for edition $edition")
    ContentApiClient.getResponse(ContentApiClient.item(path, edition)
      .showFields("all")
    ).map { response =>
      val gallery = response.content.map(Content(_))
      val model: Option[GalleryPage] = gallery collect { case g: Gallery => GalleryPage(g, StoryPackages(g, response), index, isTrail) }

      ModelOrResult(model, response)

    }.recover {convertApiExceptions}
  }

  private def renderGallery(model: GalleryPage)(implicit request: RequestHeader) = {
    val htmlResponse: (() => Html) = () =>
      views.html.gallery(model)
    val jsonResponse = () =>
      views.html.fragments.galleryBody(model)
    renderFormat(htmlResponse, jsonResponse, model, Switches.all)
  }

  private def isSupported(c: ApiContent) = c.isGallery
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
}
