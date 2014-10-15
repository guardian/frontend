package lib

import play.api.libs.ws
import language.reflectiveCalls

object WS {
  implicit class RichResponse(response: ws.Response) {
    lazy val contentType: String = response.header("Content-Type").get
  }
}
