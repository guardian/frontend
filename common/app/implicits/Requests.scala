package implicits

import play.api.mvc.RequestHeader
import play.api.http.MediaRange
import conf.Configuration.ajax._

trait Requests {
  implicit class Request2rich(r: RequestHeader) {

    def getParameter(name: String): Option[String] = r.queryString.get(name).flatMap(_.headOption)

    def getIntParameter(name: String): Option[Int] = getParameter(name).map(_.toInt)

    def getBooleanParameter(name: String): Option[Boolean] = getParameter(name).map(_.toBoolean)

    lazy val isJson: Boolean = r.getQueryString("callback").isDefined || r.headers.get("Accept").exists{ header =>
      header.contains("application/json") ||
      header.contains("text/javascript") ||
      header.contains("application/javascript")
    } || r.path.endsWith(".json")

    lazy val isRss: Boolean = r.headers.get("Accept").exists(_.contains("application/rss+xml")) || r.path.endsWith("/rss")

    lazy val isWebp: Boolean = {
      val requestedContentType = r.acceptedTypes.sorted(MediaRange.ordering)
      val imageMimeType = requestedContentType.find(media => media.accepts("image/jpeg")|| media.accepts("image/webp"))
      imageMimeType.exists(_.mediaSubType == "webp")
    }

    lazy val hasParameters: Boolean = !r.queryString.isEmpty

    lazy val isHealthcheck: Boolean = {

      println(r.headers.keys)
      r.headers.keys.exists(_ equalsIgnoreCase  "X-Gu-Management-Healthcheck")
    }
  }
}
