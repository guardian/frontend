package controllers

import common.{ExecutionContexts, Logging}
import play.api.mvc.{ Controller, Action, _ }
import play.api.libs.ws.WS
import scala.language.reflectiveCalls
import views.support._

import org.im4java.core.{ IMOperation }
import model._

object ImageController extends Controller with Logging with Implicits with ExecutionContexts {

  // URL validation: We're only going to accept proxy paths that match...
  val Path = """([/\w\.@~-]*)""".r

  def render(target: String, mode: String, profile: String) = Action { implicit request =>
    Profile.all.find(_.prefix == profile).map(renderImage(target, mode, _)).getOrElse(NotFound)
  }

  private def renderImage(target: String, mode: String, profile: Profile)(implicit request: RequestHeader): Result = {

    val Path(sanitised) = target
    val path = "http://static.guim.co.uk/" + sanitised
    val imageCacheLifetime = 86400

    Async {
        WS.url(path).get().map{ response =>
          response.status match {
            case 200 =>

                val contentType = response.contentType
                val format = contentType.fromLast("/")
                val image = response.getAHCResponse.getResponseBodyAsStream.toBufferedImage

                log.info("Resize %s (%s) to (%s,%s) at %s compression".format(path, format, profile.width, profile.height, profile.compression))

                mode match {

                  case "scalr" =>

                    val resized = image.resize(profile.width.getOrElse(50), profile.height.getOrElse(50))
                    val compressed = resized(format) compress profile.compression

                    Cached(imageCacheLifetime) {
                      Ok(compressed) as contentType
                    }

                  case "im4java" =>

                    // configuration
                    val operation = new IMOperation()
                    operation.addImage

                    (profile.width, profile.height) match {
                      case (Some(width), Some(height)) => operation.resize(width, height)
                      case (Some(width), None) => operation.resize(width)
                      case _ => Unit
                    }

                    operation.quality(profile.compression.toDouble)
                    operation.addImage(format + ":-") // TODO assumes im and content-type will always map to each other

                    val resized = model.image.Im4Java(image, operation, format)

                    Cached(imageCacheLifetime) {
                      Ok(resized) as contentType
                    }
                }

            case 404 => NotFound
          }
        }
    }
  }

}
