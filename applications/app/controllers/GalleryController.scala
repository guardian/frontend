package controllers

import com.gu.contentapi.client.model.v1.{Blocks, ItemResponse, Content => ApiContent}
import common._
import conf.switches.Switches
import contentapi.ContentApiClient
import model._
import model.dotcomrendering.{DotcomRenderingDataModel, PageType}
import pages.GalleryHtmlPage
import play.api.libs.json.JsValue
import play.api.libs.ws.WSClient
import play.api.mvc._
import play.twirl.api.Html
import renderers.DotcomRenderingService
import services.dotcomrendering.{GalleryPicker, RemoteRender}
import views.support.RenderOtherStatus

import scala.concurrent.Future

class GalleryController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    wsClient: WSClient,
    remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService(),
)(implicit context: ApplicationContext)
    extends BaseController
    with RendersItemResponse
    with GuLogging
    with ImplicitControllerExecutionContext {

  def renderJson(path: String): Action[AnyContent] = render(path)
  def render(path: String): Action[AnyContent] = Action.async { implicit request => renderItem(path) }

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = {
    val index = request.getIntParameter("index") getOrElse 1
    val isTrail = request.getBooleanParameter("trail") getOrElse false

    lookup(path, index, isTrail) flatMap {
      case Right((model, _)) if model.gallery.content.isExpired =>
        Future.successful(RenderOtherStatus(Gone)) // TODO - delete this line after switching to new content api
      case Right((model, blocks)) if request.isJson && request.forceDCR =>
        val pageType = PageType(model, request, context)

        Future.successful(
          common.renderJson(getDCRJson(model, pageType, blocks), model).as("application/json"),
        )
      case Right((model, blocks)) if GalleryPicker.getTier(model) == RemoteRender =>
        remoteRender(model, blocks)
      case Right((model, _)) => Future.successful(renderGallery(model))
      case Left(other)       => Future.successful(RenderOtherStatus(other))
    }
  }

  private def remoteRender(model: GalleryPage, blocks: Blocks)(implicit
      request: RequestHeader,
  ) = {
    val pageType = PageType(model, request, context)

    if (request.isApps) {
      remoteRenderer.getAppsGallery(wsClient, model, pageType, blocks)
    } else {
      remoteRenderer.getGallery(
        wsClient,
        model,
        pageType,
        blocks,
      )
    }
  }

  def lightboxJson(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      val index = request.getIntParameter("index") getOrElse 1
      lookup(path, index, isTrail = false) map {
        case Left(other)       => RenderOtherStatus(other)
        case Right((model, _)) => Cached(model) { JsonComponent.fromWritable(model.gallery.lightbox.javascriptConfig) }
      }
    }

  private def getDCRJson(galleryPage: GalleryPage, pageType: PageType, blocks: Blocks)(implicit
      request: RequestHeader,
  ): JsValue = {
    DotcomRenderingDataModel.toJson(DotcomRenderingDataModel.forGallery(galleryPage, request, pageType, blocks))
  }

  private def lookup(path: String, index: Int, isTrail: Boolean)(implicit
      request: RequestHeader,
  ): Future[Either[Result, (GalleryPage, Blocks)]] = {
    val edition = Edition(request)
    logInfoWithRequestId(s"Fetching gallery: $path for edition $edition")

    contentApiClient
      .getResponse(
        contentApiClient
          .item(path, edition)
          .showFields("all")
          .showBlocks("all"),
      )
      .map { response =>
        val gallery = response.content.map(Content(_))
        val blocks = response.content.flatMap(_.blocks).getOrElse(Blocks())
        val model = gallery collect { case g: Gallery =>
          GalleryPage(g, StoryPackages(g.metadata.id, response), index, isTrail)
        }

        ModelOrResult(model.map((_, blocks)), response)

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
