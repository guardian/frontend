package implicits

import play.api.libs.ws

trait WSResponse {

  implicit class WsResponse2ContentType(response: ws.Response) {
    lazy val contentType: String = response.header("Content-Type").get
  }
}