package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import conf._
import common._
import model._
import play.api.mvc.{ Content => _, _ }
import play.api.Play.current
import play.api.libs.concurrent.Akka

case class VideoPage(video: Video, storyPackage: List[Trail])

object VideoController extends Controller with Logging {

  def render(path: String) = Action { implicit request =>
    val promiseOfVideo = Akka.future(lookup(path))
    Async {
      promiseOfVideo.map(_.map { renderVideo }.getOrElse { NotFound })
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader): Option[VideoPage] = suppressApi404 {
    val edition = Edition(request, Configuration)
    log.info("Fetching video: " + path + " for edition " + edition)
    val response: ItemResponse = ContentApi.item(path, edition)
      .showTags("all")
      .showFields("all")
      .response

    val videoOption = response.content.filter { _.isVideo } map { new Video(_) }
    val storyPackage = response.storyPackage map { new Content(_) }

    videoOption map { video => VideoPage(video, storyPackage.filterNot(_.id == video.id)) }
  }

  private def renderVideo(model: VideoPage)(implicit request: RequestHeader): Result =
    Cached(model.video) {
      Ok(Compressed(views.html.video(model.video, model.storyPackage, Edition(request, Configuration))))
    }
}
