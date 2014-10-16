package lib

import play.api.libs.ws
import language.reflectiveCalls

object WS {
  implicit class RichResponse(response: ws.WSResponseHeaders) {
    lazy val contentType: String = response.headers.get("Content-Type").map(_ mkString " ").getOrElse("")
  }
}
