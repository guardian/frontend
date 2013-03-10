package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import conf._
import common._
import model._
import play.api.mvc.{ Content => _, _ }
import play.api.libs.concurrent.Execution.Implicits._
import concurrent.Future

case class VideoPage(video: Video, storyPackage: List[Trail])

object VideoController extends Controller with Logging {

  def render(path: String) = Action { implicit request =>
    val promiseOfVideo = Future(lookup(path))
    Async {
      promiseOfVideo.map {
        case Left(model) if model.video.isExpired => Gone(Compressed(views.html.expired(model.video)))
        case Left(model) => renderVideo(model)
        case Right(notFound) => notFound
      }
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader) = suppressApi404 {
    val edition = Site(request).edition
    log.info(s"Fetching video: $path for edition $edition")
    val response: ItemResponse = ContentApi.item(path, edition)
      .showExpired(true)
      .showTags("all")
      .showFields("all")
      .response

    val videoOption = response.content.filter { _.isVideo } map { new Video(_) }
    val storyPackage = response.storyPackage map { new Content(_) }

    val model = videoOption map { video => VideoPage(video, storyPackage.filterNot(_.id == video.id)) }
    ModelOrResult(model, response)
  }

  private def renderVideo(model: VideoPage)(implicit request: RequestHeader): Result =
    Cached(model.video) {
      Ok(Compressed(views.html.video(model.video, model.storyPackage, Site(request).edition)))
    }
}
