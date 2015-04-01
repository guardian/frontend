package implicits

import play.api.mvc.ResponseHeader

trait Responses {
  implicit class Response2IsImage(r: ResponseHeader) {
    lazy val isImage: Boolean = r.headers.get("Content-Type").exists(_.startsWith("image/"))
  }
}

object Responses extends Responses
