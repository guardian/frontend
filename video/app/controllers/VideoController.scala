package controllers

import conf._
import common._
import model._
import play.api.mvc.{ Content => _, _ }
import play.api.libs.concurrent.Execution.Implicits._

case class VideoPage(video: Video, storyPackage: List[Trail])

object VideoController extends Controller with Logging {

  def render(path: String) = Action { implicit request =>
    val promiseOfVideo = lookup(path)
    Async {
      promiseOfVideo.map {
        case Left(model) if model.video.isExpired => Gone(Compressed(views.html.expired(model.video)))
        case Left(model) => renderVideo(model)
        case Right(notFound) => notFound
      }
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader) = {
    val edition = Edition(request)
    log.info(s"Fetching video: $path for edition $edition")
    ContentApi.item(path, edition)
      .showExpired(true)
      .showTags("all")
      .showFields("all")
      .response.map{response =>
        val videoOption = response.content.filter { _.isVideo } map { new Video(_) }
        val storyPackage = response.storyPackage map { new Content(_) }

        val model = videoOption map { video => VideoPage(video, storyPackage.filterNot(_.id == video.id)) }
        ModelOrResult(model, response)
    }.recover{suppressApiNotFound}
  }

  private def renderVideo(model: VideoPage)(implicit request: RequestHeader): Result = {
    val htmlResponse = views.html.video(model.video, model.storyPackage, Edition(request))
    val jsonResponse = views.html.fragments.videoBody(model.video, model.storyPackage, Edition(request))
    renderFormat(htmlResponse, jsonResponse, model.video, Switches.all)
  }
    
}
