package controllers

import common.Logging
import play.api.mvc.{ Controller, Action, _ }
import play.api.libs.ws.WS
import scala.language.reflectiveCalls
import play.api.libs.concurrent.Execution.Implicits._
import org.im4java.core.{ IMOperation }
import model._

object ImageController extends Controller with Logging with Implicits {

  // URL validation: We're only going to accept proxy paths that match [/\w\.-]*
  val Path = """([/\w\.-]*)""".r

  def render(target: String, mode: String, profile: String) = Action { implicit request =>
    profile match {
      case "c" => renderImage(target, mode, model.image.Contributor)
      case "g" => renderImage(target, mode, model.image.Gallery)
      case "n" => renderImage(target, mode, model.image.Naked) // no resizing, just passed through GraphicsMagick 
      
      case "test/flip" => renderImage(target, mode, model.image.Flip)
      case "test/grey" => renderImage(target, mode, model.image.Grey)
      case "test/crop" => renderImage(target, mode, model.image.Crop)

      case _ => NotFound
    }
  }

  private def renderImage(target: String, mode: String, profile: image.Profile)(implicit request: RequestHeader): Result = { 

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
                    
                    val resized = image.resize(profile.width, profile.height)
                    val compressed = resized(format) compress profile.compression
                    
                    Cached(imageCacheLifetime) {
                      Ok(compressed) as contentType
                    }

                  case "im4java" =>

                    // configuration
                    val operation = profile.operation.addImage(format + ":-") 
                    val resized = model.image.Transform(image, operation, format)
                  
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
