package common

import play.api.mvc.RequestHeader
import conf.Switches

// TODO rethink/ remove me
object Host {
  def apply(request: RequestHeader) = request.host
}

object IsFacia {
  def apply(request: RequestHeader): Boolean =
    request.headers.get("X-Gu-Facia").filter(_=="true").isDefined &&
    Switches.FaciaSwitch.isSwitchedOn
}
