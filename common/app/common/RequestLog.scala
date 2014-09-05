package common

import play.api.mvc.{Headers, RequestHeader}


object RequestLog {

  private implicit class Get2Safe(headers: Headers) {
    def safe(key: String) = headers.get(key).getOrElse("")
  }

  def apply(r: RequestHeader): String = Seq(
    r.headers.safe("X-Forwarded-For"),
    r.host,
    r.headers.safe("X-Gu-Edition"),
    r.headers.safe("X-GU-GeoLocation"),
    r.headers.safe("X-Gu-Xid"), // a unique id for this request,
    r.path,
    r.headers.safe("Referer"),
    s""" "${r.headers.safe("User-Agent")}" """.trim
  ).mkString(", ")

}
