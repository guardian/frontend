package controllers

import common.Logging
import play.api.mvc.{ Controller, Action }
import play.api.libs.ws.WS
import scala.language.reflectiveCalls
import play.api.libs.concurrent.Execution.Implicits._
import org.im4java.core.{ IMOperation }
import model._

object ImageController extends Controller with Logging with Implicits {

  // URL validation: We're only going to accept proxy paths that match [/\w\.-]*
  val Path = """([/\w\.-]*)""".r

  def render(target: String, mode: String) = Action { implicit request =>
    val Path(sanitised) = target
    val path = "http://static.guim.co.uk/" + sanitised
    
    Async {
        WS.url(path).get().map{ response =>
          response.status match {
            case 200 =>
  
                val contentType = response.contentType
                val format = contentType.fromLast("/")
                val image = response.getAHCResponse.getResponseBodyAsStream.toBufferedImage
                
                log.info("Resize %s (%s) to (%s,%s) at %s compression".format(path, format, TrailImage.width, TrailImage.height, TrailImage.compression))
                
                mode match {
                  
                  case "scalr" => 
                    
                    val resized = image.resize(TrailImage.width, TrailImage.height)
                    val compressed = resized(format) compress TrailImage.compression
                    
                    Cached(86400) {
                      Ok(compressed) as contentType
                    }

                  case "im4java" =>
          
                    // configuration
                    val operation = new IMOperation()
                    operation.addImage
                    operation.resize(TrailImage.width, TrailImage.height)
                    operation.quality(TrailImage.compression.toDouble)
                    operation.addImage(format + ":-") // TODO assumes im and content-type will always map to each other
                    
                    val resized = Im4Java(image, operation, format)
                  
                    Cached(86400) {
                      Ok(resized) as contentType
                    }
                }

            case 404 => NotFound
          }
        }
    }
  }  

}
