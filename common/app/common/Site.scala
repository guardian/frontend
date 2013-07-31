package common

import play.api.mvc.RequestHeader

// TODO rethink/ remove me
object Host {
  def apply(request: RequestHeader) = request.host
}
