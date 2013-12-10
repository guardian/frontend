package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import conf._
import common._
import model._
import play.api.mvc.{ Content => _, _ }
import scala.concurrent.Future
import views.support.RenderOtherStatus


case class VideoPage(video: Video, storyPackage: List[Trail])

object VideoController extends Controller with Logging with ExecutionContexts {

  def renderJson(path: String) = render(path)
  def render(path: String) = Action.async { implicit request =>
    lookup(path) map {
      case Left(model) if model.video.isExpired => RenderOtherStatus(Gone) // TODO - delete this line after switching to new content api
      case Left(model) => renderVideo(model)
      case Right(other) => RenderOtherStatus(other)
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader) = {
    val edition = Edition(request)

    log.info(s"Fetching video: $path for edition $edition")
    val response: Future[ItemResponse] = ContentApi.item(path, edition)
      .showExpired(true)
      .showFields("all")
      .response

    val result = response map { response =>
      val storyPackage = response.storyPackage map { Content(_) }
      val videoOption = response.content filter { _.isVideo } map { new Video(_) }
      val model = videoOption map { video => VideoPage(video, storyPackage.filterNot(_.id == video.id)) }

      ModelOrResult(model, response)
    }

    result recover suppressApiNotFound
  }

  private def renderVideo(model: VideoPage)(implicit request: RequestHeader): SimpleResult = {
    val htmlResponse = () => views.html.video(model)
    val jsonResponse = () => views.html.fragments.videoBody(model)
    renderFormat(htmlResponse, jsonResponse, model.video, Switches.all)
  }
}
