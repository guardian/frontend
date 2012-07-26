package common

import play.api.mvc.RequestHeader

object Edition extends Logging {
  def apply(request: RequestHeader, config: GuardianConfiguration) = {
    val host = request.headers.get("host")
    val edition = config.edition(host)
    log.info("Edition resolved %s -> %s" format (host.getOrElse("UNKNOWN"), edition))
    edition
  }
}