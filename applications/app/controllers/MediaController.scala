package controllers

import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import com.gu.contentapi.client.model.ItemResponse
import common._
import conf.LiveContentApi.getResponse
import conf._
import conf.switches.Switches
import model._
import play.api.mvc._
import views.support.RenderOtherStatus

import scala.concurrent.Future

case class MediaPage(media: ContentType, related: RelatedContent) extends ContentPage {
  override lazy val item = media
}

object MediaController extends Controller with RendersItemResponse with Logging with ExecutionContexts {

  def renderJson(path: String) = render(path)
  def render(path: String) = Action.async { implicit request => renderItem(path) }

  private def lookup(path: String)(implicit request: RequestHeader) = {
    val edition = Edition(request)

    log.info(s"Fetching media: $path for edition $edition")
    val response: Future[ItemResponse] = getResponse(
      LiveContentApi.item(path, edition)
        .showFields("all")
    )

    val result = response map { response =>
      val mediaOption: Option[ContentType] = response.content.filter(isSupported).map(Content(_))
      val model = mediaOption map { media => MediaPage(media, RelatedContent(media, response)) }

      ModelOrResult(model, response)
    }

    result recover convertApiExceptions
  }

  private def renderMedia(model: MediaPage)(implicit request: RequestHeader): Result = {
    val htmlResponse = () => views.html.media(model)
    val jsonResponse = () => views.html.fragments.mediaBody(model)
    renderFormat(htmlResponse, jsonResponse, model, Switches.all)
  }

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = lookup(path) map {
    case Left(model) => renderMedia(model)
    case Right(other) => RenderOtherStatus(other)
  }

  private def isSupported(c: ApiContent) = c.isVideo || c.isAudio
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
}
