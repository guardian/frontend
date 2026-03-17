package controllers

import com.gu.contentapi.client.model.v1.{Blocks, ItemResponse, Content => ApiContent}
import common.JsonComponent.withRefreshStatus
import common._
import conf.switches.Switches
import contentapi.ContentApiClient
import implicits.{AppsFormat, JsonFormat}
import model._
import model.dotcomrendering.{DotcomRenderingDataModel, PageType}
import pages.ContentHtmlPage
import play.api.libs.json.{Format, JsObject, JsValue, Json}
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.DotcomRenderingService
import services.dotcomrendering.{MediaPicker, RemoteRender}
import views.support.RenderOtherStatus

import scala.concurrent.Future

class MediaController(
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

  def renderInfoJson(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      lookup(path) map {
        case Right((model, _)) => MediaInfo(expired = false, shouldHideAdverts = model.media.content.shouldHideAdverts)
        case Left(other)       => MediaInfo(expired = other.header.status == GONE, shouldHideAdverts = true)
      } map { mediaInfo =>
        Cached(60)(JsonComponent.fromWritable(withRefreshStatus(Json.toJson(mediaInfo).as[JsObject])))
      }
    }

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] =
    lookup(path) flatMap {
      case Right((model, blocks)) =>
        MediaPicker.getTier(model) match {
          case RemoteRender => remoteRender(model, blocks)
          case _            => Future.successful(renderMedia(model))
        }
      case Left(other) => Future.successful(RenderOtherStatus(other))
    }

  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)

  private def lookup(path: String)(implicit request: RequestHeader): Future[Either[Result, (MediaPage, Blocks)]] = {
    val edition = Edition(request)

    logDebugWithRequestId(s"Fetching media: $path for edition $edition")

    val response: Future[ItemResponse] = contentApiClient.getResponse(
      contentApiClient
        .item(path, edition)
        .showFields("all")
        .showAtoms("media")
        .showBlocks("all"),
    )

    val result = response map { response =>
      val mediaOption: Option[ContentType] = response.content.filter(isSupported).map(Content(_))
      val modelWithBlocks = mediaOption map { media =>
        val model = MediaPage(media, StoryPackages(media.metadata.id, response))
        val blocks = response.content.flatMap(_.blocks).getOrElse(Blocks())

        (model, blocks)
      }

      ModelOrResult(modelWithBlocks, response)
    }

    result recover convertApiExceptions
  }

  private def isSupported(c: ApiContent) = c.isVideo || c.isAudio

  private def renderMedia(model: MediaPage)(implicit request: RequestHeader): Result = {
    val htmlResponse = () => ContentHtmlPage.html(model)
    // The jsonResponse allows for a json version of each page to be accessed by users eg: https://www.theguardian.com/world/2018/jun/13/kim-jong-un-north-korea-summit-trump-visit-kcna.json
    val jsonResponse = model.media match {
      case audio: Audio => () => views.html.fragments.audioBody(model, audio)
      case _            => () => views.html.fragments.mediaBody(model, displayCaption = false)
    }
    renderFormat(htmlResponse, jsonResponse, model, Switches.all)
  }

  private def getDCRJson(content: MediaPage, pageType: PageType, blocks: Blocks)(implicit
      request: RequestHeader,
  ): JsValue = {
    DotcomRenderingDataModel.toJson(DotcomRenderingDataModel.forMedia(content, request, pageType, blocks))
  }

  private def remoteRender(content: MediaPage, blocks: Blocks)(implicit
      request: RequestHeader,
  ): Future[Result] = {
    val pageType = PageType(content, request, context)

    request.getRequestFormat match {
      case JsonFormat =>
        Future.successful(
          common.renderJson(getDCRJson(content, pageType, blocks), content).as("application/json"),
        )
      case AppsFormat =>
        remoteRenderer.getAppsMedia(
          wsClient,
          content,
          pageType,
          blocks,
        )
      case _ =>
        remoteRenderer.getMedia(
          wsClient,
          content,
          pageType,
          blocks,
        )
    }
  }
}

case class MediaInfo(expired: Boolean, shouldHideAdverts: Boolean)
object MediaInfo {
  implicit val jsonFormats: Format[MediaInfo] = Json.format[MediaInfo]
}
