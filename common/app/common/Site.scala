package common

import play.api.mvc.RequestHeader
import conf.Switches

// TODO rethink/ remove me
object Host {
  def apply(request: RequestHeader) = request.host
}
