package controllers

import com.gu.contentapi.client.model.v1.{ItemResponse, Content => ApiContent}
import common._
import conf.switches.Switches
import contentapi.ContentApiClient
import model._
import pages.GalleryHtmlPage
import play.api.mvc._
import play.twirl.api.Html
import views.support.RenderOtherStatus

import scala.concurrent.Future

class GalleryController(contentApiClient: ContentApiClient, val controllerComponents: ControllerComponents)(implicit
    context: ApplicationContext,
) extends BaseController
    with RendersItemResponse
    with GuLogging
    with ImplicitControllerExecutionContext {

  def renderJson(path: String): Action[AnyContent] = render(path)
  def render(path: String): Action[AnyContent] = Action.async { implicit request => renderItem(path) }

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = {
    val index = request.getIntParameter("index") getOrElse 1
    val isTrail = request.getBooleanParameter("trail") getOrElse false

    lookup(path, index, isTrail) map {
      case Right(model) if model.gallery.content.isExpired =>
        RenderOtherStatus(Gone) // TODO - delete this line after switching to new content api
      case Right(model) => renderGallery(model)
      case Left(other)  => RenderOtherStatus(other)
    }
  }

  def lightboxJson(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      val index = request.getIntParameter("index") getOrElse 1
      lookup(path, index, isTrail = false) map {
        case Left(other)  => RenderOtherStatus(other)
        case Right(model) => Cached(model) { JsonComponent.fromWritable(model.gallery.lightbox.javascriptConfig) }
      }
    }

  private def lookup(path: String, index: Int, isTrail: Boolean)(implicit request: RequestHeader) = {
    val edition = Edition(request)
    log.info(s"Fetching gallery: $path for edition $edition")
    contentApiClient
      .getResponse(
        contentApiClient
          .item(path, edition)
          .showFields("all"),
      )
      .map { response =>
        val gallery = response.content.map(Content(_))
        val model: Option[GalleryPage] = gallery collect {
          case g: Gallery => GalleryPage(g, StoryPackages(g.metadata.id, response), index, isTrail)
        }

        ModelOrResult(model, response)

      }
      .recover { convertApiExceptions }
  }

  private def renderGallery(model: GalleryPage)(implicit request: RequestHeader) = {
    val htmlResponse: (() => Html) = () => GalleryHtmlPage.html(model)
    val jsonResponse = () => views.html.fragments.galleryBody(model)
    renderFormat(htmlResponse, jsonResponse, model, Switches.all)
  }

  private def isSupported(c: ApiContent) = c.isGallery
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
}
