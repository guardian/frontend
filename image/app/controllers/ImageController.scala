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

  def renderContributor(target: String, mode: String) = Action { implicit request =>
    render(target, mode, model.Contributor)
  }
  
  def renderGallery(target: String, mode: String) = Action { implicit request =>
    render(target, mode, model.Gallery)
  }

  private def render(target: String, mode: String, profile: ImageProfile)(implicit request: RequestHeader): Result = { 

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
                    val operation = new IMOperation()
                    operation.addImage
                    operation.resize(profile.width, profile.height)
                    operation.quality(profile.compression.toDouble)
                    operation.addImage(format + ":-") // TODO assumes im and content-type will always map to each other
                    
                    val resized = Im4Java(image, operation, format)
                  
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
