package implicits

import play.api.libs.ws

trait WSResponse {

  implicit def wsResponse2ContentType(response: ws.Response) = new {
    lazy val contentType: String = response.header("Content-Type").get
  }
}