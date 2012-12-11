package controllers

import common.Logging
import play.api.mvc.{ Controller, Action }
import play.api.libs.ws.WS

object ImageController extends Controller with Logging with Implicits {

  // URL validation: We're only going to accept proxy paths that match [/\w\.-]*
  val Path = """([/\w\.-]*)""".r

  def render(target: String, width: Int, height: Int, compression: Int) = Action { implicit request =>
    val Path(sanitised) = target
    val path = "http://static.guim.co.uk/" + sanitised

    Async {
      WS.url(path).get() map { response =>
        // TODO: Handle response.status == 40x with NotFound

        val contentType = response.contentType
        val format = contentType.fromLast("/")

        log.info("Resize %s (%s) to (%s,%s)".format(path, format, width, height))

        val image = response.getAHCResponse.getResponseBodyAsStream.toBufferedImage
        val resized = image.resize(width, height)
        val compressed = resized(format) compress compression

        Ok(compressed) as contentType
      }
    }
  }
}
