package controllers

import com.gu.contentapi.client.model.v1.{ItemResponse, Content => ApiContent}
import common._
import contentapi.ContentApiClient
import conf.switches.Switches
import model._
import play.api.libs.json.{Format, JsObject, Json}
import play.api.mvc._
import views.support.RenderOtherStatus
import JsonComponent.withRefreshStatus
import pages.ContentHtmlPage

import scala.concurrent.Future

case class MediaPage(media: ContentType, related: RelatedContent) extends ContentPage {
  override lazy val item = media
}

class MediaController(contentApiClient: ContentApiClient, val controllerComponents: ControllerComponents)(implicit
    context: ApplicationContext,
) extends BaseController
    with RendersItemResponse
    with GuLogging
    with ImplicitControllerExecutionContext {

  def renderJson(path: String): Action[AnyContent] = render(path)
  def render(path: String): Action[AnyContent] = Action.async { implicit request => renderItem(path) }

  def renderInfoJson(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      lookup(path) map {
        case Right(model) => MediaInfo(expired = false, shouldHideAdverts = model.media.content.shouldHideAdverts)
        case Left(other)  => MediaInfo(expired = other.header.status == GONE, shouldHideAdverts = true)
      } map { mediaInfo =>
        Cached(60)(JsonComponent.fromWritable(withRefreshStatus(Json.toJson(mediaInfo).as[JsObject])))
      }
    }

  private def lookup(path: String)(implicit request: RequestHeader) = {
    val edition = Edition(request)

    log.info(s"Fetching media: $path for edition $edition")
    val response: Future[ItemResponse] = contentApiClient.getResponse(
      contentApiClient
        .item(path, edition)
        .showFields("all")
        .showAtoms("media"),
    )

    val result = response map { response =>
      val mediaOption: Option[ContentType] = response.content.filter(isSupported).map(Content(_))
      val model = mediaOption map { media => MediaPage(media, StoryPackages(media.metadata.id, response)) }

      ModelOrResult(model, response)
    }

    result recover convertApiExceptions
  }

  private def renderMedia(model: MediaPage)(implicit request: RequestHeader): Result = {
    val htmlResponse = () => ContentHtmlPage.html(model)
    // The jsonResponse allows for a json version of each page to be accessed by users eg: https://www.theguardian.com/world/2018/jun/13/kim-jong-un-north-korea-summit-trump-visit-kcna.json
    val jsonResponse = model.media match {
      case audio: Audio => () => views.html.fragments.audioBody(model, audio)
      case _            => () => views.html.fragments.mediaBody(model, displayCaption = false)
    }
    renderFormat(htmlResponse, jsonResponse, model, Switches.all)
  }

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] =
    lookup(path) map {
      case Right(model) => renderMedia(model)
      case Left(other)  => RenderOtherStatus(other)
    }

  private def isSupported(c: ApiContent) = c.isVideo || c.isAudio
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
}

case class MediaInfo(expired: Boolean, shouldHideAdverts: Boolean)
object MediaInfo {
  implicit val jsonFormats: Format[MediaInfo] = Json.format[MediaInfo]
}
