package common

import play.api.mvc.RequestHeader

// TODO rethink/ remove me
object Host {
  def apply(request: RequestHeader) = request.host
}

object IsFacia {
  def apply(request: RequestHeader): Option[String] =
    request.headers.get("X-Gu-Facia").filter(_=="true")
}
