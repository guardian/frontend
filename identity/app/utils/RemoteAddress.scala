package utils

import play.api.mvc.RequestHeader
import common.Logging

trait RemoteAddress extends Logging {
  private val Ip = """(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})""".r

  def clientIp(request: RequestHeader): Option[String] = {
    request.headers.get("X-Forwarded-For").flatMap { xForwardedFor =>
      xForwardedFor.split(", ").find {  // leftmost non-private IP from header is client
        case Ip(a, b, c, d) => {
          if ("10" == a) false
          else if ("192" == a && "168" == b) false
          else if ("172" == a && (16 to 31).map(_.toString).contains(b)) false
          else true
        }
        case _ => false
      }
    }
  }
}
