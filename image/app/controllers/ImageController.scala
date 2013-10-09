package controllers

import common.{ ExecutionContexts, Logging }
import conf.Switches._
import play.api.http.MediaRange
import play.api.libs.ws.{WS, Response}
import play.api.mvc._
import services.ImageResizer._
import scala.concurrent.Future
import views.support._

object ImageController extends Controller with Logging with Implicits with ExecutionContexts {

  // URL validation: We're only going to accept proxy paths that match...
  val Path = """([/\w\.@~-]*)""".r

  def render(target: String, profile: String) = Action.async { implicit request: RequestHeader =>
    val dimensions = Profile.all find { _.prefix == profile }
    val image: Option[Future[SimpleResult]] = dimensions map {renderImage(target, _)}

    image.getOrElse(Future(NotFound))
  }

  def renderImage(target: String, profile: Profile)(implicit request: RequestHeader): Future[SimpleResult] = {
    val Path(sanitised) = target
    val path = "http://static.guim.co.uk/" + sanitised
    val imageCacheLifetime = 86400

    // Find the highest priority accept type
    val requestedContentType = request.acceptedTypes.sorted(MediaRange.ordering)
    val imageMimeType = requestedContentType.find(media => media.accepts("image/jpeg")|| media.accepts("image/webp"))
    val wsRequest: Future[Response]  = WS.url(path).get()

    val renderSubtype = imageMimeType match {
      case Some(media) if (media.mediaSubType == "webp" && ServeWebPImagesSwitch.isSwitchedOn) => renderWebp _
      case _ => renderJpeg _
    }
    wsRequest.map{renderSubtype(path, imageCacheLifetime, profile)}
  }
}
