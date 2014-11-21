package controllers

import com.gu.contentapi.client.model.ItemResponse
import conf._
import common._
import model._
import play.api.mvc.{ Content => _, _ }
import scala.concurrent.Future
import views.support.RenderOtherStatus
import conf.Switches.RelatedContentSwitch


case class MediaPage(media: Media, related: RelatedContent)

object MediaController extends Controller with Logging with ExecutionContexts {

  def renderJson(path: String) = render(path)
  def render(path: String) = Action.async { implicit request =>
    lookup(path) map {
      case Left(model) => renderMedia(model)
      case Right(other) => RenderOtherStatus(other)
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader) = {
    val edition = Edition(request)

    log.info(s"Fetching media: $path for edition $edition")
    val response: Future[ItemResponse] = LiveContentApi.item(path, edition)
      .showRelated(InlineRelatedContentSwitch.isSwitchedOn)
      .showFields("all")
      .response

    val result = response map { response =>
      val storyPackage = response.storyPackage map { Content(_) }
      val mediaOption: Option[Media] = response.content filter { content => content.isAudio || content.isVideo } map {
        case a if a.isAudio => Audio(a)
        case v => Video(v)
      }
      val model = mediaOption map { media => MediaPage(media, RelatedContent(media, response)) }

      ModelOrResult(model, response)
    }

    result recover convertApiExceptions
  }

  private def renderMedia(model: MediaPage)(implicit request: RequestHeader): Result = {
    val htmlResponse = () => views.html.media(model)
    val jsonResponse = () => views.html.fragments.mediaBody(model)
    renderFormat(htmlResponse, jsonResponse, model.media, Switches.all)
  }
}
