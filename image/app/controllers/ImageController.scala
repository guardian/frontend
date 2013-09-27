package controllers

import common.{ ExecutionContexts, Logging }
import model._
import org.im4java.core.IMOperation
import play.api.libs.ws.WS
import play.api.mvc._
import scala.concurrent.Future
import views.support._


object ImageController extends Controller with Logging with Implicits with ExecutionContexts {

  // URL validation: We're only going to accept proxy paths that match...
  val Path = """([/\w\.@~-]*)""".r

  def render(target: String, mode: String, profile: String) = Action.async { implicit request =>
    val dimensions = Profile.all find { _.prefix == profile }
    val image: Option[Future[SimpleResult]] = dimensions map { renderImage(target, mode, _) }

    image.getOrElse(Future { NotFound })
  }

  private def renderImage(target: String, mode: String, profile: Profile)(implicit request: RequestHeader): Future[SimpleResult] = {
    val Path(sanitised) = target
    val path = "http://static.guim.co.uk/" + sanitised
    val imageCacheLifetime = 86400

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
              val formatted = resized formattedWith format
              val compressed = formatted compressedTo profile.compression

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
