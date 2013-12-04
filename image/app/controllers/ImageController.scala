package controllers

import common.{ ExecutionContexts, Logging }
import conf.Switches._
import play.api.libs.ws.WS
import play.api.mvc._
import services.ImageResizer._
import scala.concurrent.Future
import views.support._
import implicits.Requests

object ImageController extends Controller with Logging with Implicits with ExecutionContexts with Requests {

  // URL validation: We're only going to accept proxy paths that match...
  val Path = """([/\w\.,@~-]*)""".r

  def render(target: String, profile: String) = Action.async { implicit request: RequestHeader =>
    val dimensions = Profile.all find { _.prefix == profile }
    val image: Option[Future[SimpleResult]] = dimensions map {renderImage(target, _)}

    image.getOrElse(Future(NotFound))
  }

  def renderImage(target: String, profile: Profile)(implicit request: RequestHeader): Future[SimpleResult] = {
    val Path(sanitised) = target
    val path = "http://static.guim.co.uk/" + sanitised
    val imageCacheLifetime = 86400

    WS.url(path).get().map{ response =>
      if (request.isWebp && ServeWebPImagesSwitch.isSwitchedOn)
        renderWebp(path, imageCacheLifetime, profile)(response)
      else
        renderJpeg(path, imageCacheLifetime, profile)(response)
    }
  }
}
