package controllers

import com.gu.contentapi.client.model.v1.{Block, ItemResponse, Content => ApiContent}
import com.gu.contentapi.client.model.{Direction, FollowingSearchQuery, SearchQuery}
import common._
import conf.Configuration.contentApi
import conf.switches.Switches
import contentapi.ContentApiClient
import implicits.{AppsFormat, JsonFormat}
import model._
import model.dotcomrendering.{DotcomRenderingDataModel, PageType}
import pages.ContentHtmlPage
import play.api.libs.json._
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.DotcomRenderingService
import services.ImageQuery
import services.dotcomrendering.{ImageContentPicker, RemoteRender}
import views.support.RenderOtherStatus

import scala.concurrent.Future

class ImageContentController(
    val contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    wsClient: WSClient,
    remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService(),
)(implicit context: ApplicationContext)
    extends BaseController
    with RendersItemResponse
    with ImageQuery
    with GuLogging
    with ImplicitControllerExecutionContext {

  def renderJson(path: String): Action[AnyContent] = render(path)

  def render(path: String): Action[AnyContent] = Action.async { implicit request => renderItem(path) }

  private def renderImageContent(page: ImageContentPage)(implicit request: RequestHeader): Result = {
    val htmlResponse = () => ContentHtmlPage.html(page)
    val jsonResponse = () => views.html.fragments.imageContentBody(page)
    renderFormat(htmlResponse, jsonResponse, page, Switches.all)
  }

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] =
    image(Edition(request), path).flatMap {
      case Right((content, mainBlock)) =>
        val tier = ImageContentPicker.getTier(content)

        tier match {
          case RemoteRender => remoteRender(content, mainBlock)
          case _            => Future.successful(renderImageContent(content))
        }
      case Left(result) => Future.successful(RenderOtherStatus(result))
    }

  private def getDCRJson(content: ImageContentPage, pageType: PageType, mainBlock: Option[Block])(implicit
      request: RequestHeader,
  ): String = {
    DotcomRenderingDataModel.toJson(DotcomRenderingDataModel.forImageContent(content, request, pageType, mainBlock))
  }

  private def remoteRender(content: ImageContentPage, mainBlock: Option[Block])(implicit
      request: RequestHeader,
  ): Future[Result] = {
    val pageType = PageType(content, request, context)

    request.getRequestFormat match {
      case JsonFormat =>
        Future.successful(
          common.renderJson(getDCRJson(content, pageType, mainBlock), content).as("application/json"),
        )
      case AppsFormat =>
        remoteRenderer.getAppsImageContent(
          wsClient,
          content,
          pageType,
          mainBlock,
        )
      case _ =>
        remoteRenderer.getImageContent(
          wsClient,
          content,
          pageType,
          mainBlock,
        )
    }
  }

  private def isSupported(c: ApiContent) = c.isImageContent
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)

  def getNextLightboxJson(path: String, tag: String, direction: String): Action[AnyContent] =
    Action.async { implicit request =>
      val capiQuery = FollowingSearchQuery(
        SearchQuery().tag(tag).showTags("all").showElements("image").pageSize(contentApi.nextPreviousPageSize),
        path,
        Direction.forPathSegment(direction),
      )

      contentApiClient.thriftClient.getResponse(capiQuery).map { response =>
        val lightboxJson = response.results.flatMap(result =>
          Content(result) match {
            case content: ImageContent => Some(content.lightBox.javascriptConfig)
            case _                     => None
          },
        )

        if (request.forceDCR)
          Cached(CacheTime.Default)(
            JsonComponent.fromWritable(
              Json.obj(
                "total" -> response.total,
                "images" -> JsArray(lightboxJson),
              ),
            ),
          )
        else
          Cached(CacheTime.Default)(JsonComponent.fromWritable(JsArray(lightboxJson)))

      }
    }
}
