package implicits

import play.api.mvc.{Request, RequestHeader}
import play.api.http.MediaRange
import conf.Configuration.ajax._

trait Requests {
  implicit class RichRequestHeader(r: RequestHeader) {

    def getParameter(name: String): Option[String] = r.queryString.get(name).flatMap(_.headOption)

    def getIntParameter(name: String): Option[Int] = getParameter(name).map(_.toInt)

    def getBooleanParameter(name: String): Option[Boolean] = getParameter(name).map(_.toBoolean)

    lazy val isJson: Boolean = r.getQueryString("callback").isDefined || r.path.endsWith(".json")

    lazy val isRss: Boolean = r.path.endsWith("/rss")

    lazy val isWebp: Boolean = {
      val requestedContentType = r.acceptedTypes.sorted(MediaRange.ordering)
      val imageMimeType = requestedContentType.find(media => media.accepts("image/jpeg")|| media.accepts("image/webp"))
      imageMimeType.exists(_.mediaSubType == "webp")
    }

    lazy val hasParameters: Boolean = !r.queryString.isEmpty

    lazy val isHealthcheck: Boolean = r.headers.keys.exists(_ equalsIgnoreCase  "X-Gu-Management-Healthcheck")

    // see http://docs.aws.amazon.com/ElasticLoadBalancing/latest/DeveloperGuide/TerminologyandKeyConcepts.html#x-forwarded-proto
    lazy val isSecure: Boolean = r.headers.get("X-Forwarded-Proto").exists(_.equalsIgnoreCase("https"))
  }

  implicit class RichRequest[A](val request: RequestHeader) {
    //This is a header reliably set by jQuery for AJAX requests used in facia-tool
    lazy val isXmlHttpRequest: Boolean = request.headers.get("X-Requested-With").exists(_ == "XMLHttpRequest")
  }
}

object Requests extends Requests
