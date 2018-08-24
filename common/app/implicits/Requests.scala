package implicits

import conf.Configuration
import play.api.mvc.RequestHeader

sealed trait RequestFormat
case object HtmlFormat extends RequestFormat
case object JsonFormat extends RequestFormat
case object EmailFormat extends RequestFormat
case object AmpFormat extends RequestFormat

trait Requests {

  val EMAIL_SUFFIX = "/email"

  implicit class RichRequestHeader(r: RequestHeader) {

    def getParameter(name: String): Option[String] = r.queryString.get(name).flatMap(_.headOption)

    def getParameters(name: String): Seq[String] = r.queryString.getOrElse(name, Nil)

    def getIntParameter(name: String): Option[Int] = getParameter(name).map(_.toInt)

    def getBooleanParameter(name: String): Option[Boolean] = getParameter(name).map(_.toBoolean)

    def getRequestFormat: RequestFormat = if(isJson) JsonFormat else if (isEmail) EmailFormat else if(isAmp) AmpFormat else HtmlFormat

    lazy val isJson: Boolean = r.getQueryString("callback").isDefined || r.path.endsWith(".json")

    lazy val isEmailJson: Boolean = r.path.endsWith(".emailjson")

    // parameters for moon/guui new rendering layer project.
    lazy val isGuuiJson: Boolean = isJson && isGuui

    lazy val isGuui: Boolean = r.getQueryString("guui").isDefined

    lazy val isRss: Boolean = r.path.endsWith("/rss")

    lazy val isAmp: Boolean = r.getQueryString("amp").isDefined || (!r.host.isEmpty && r.host == Configuration.amp.host)

    lazy val isEmail: Boolean = r.getQueryString("format").exists(_.contains("email")) || r.path.endsWith(EMAIL_SUFFIX) || isEmailJson

    lazy val isEmailHeadlineText: Boolean = r.getQueryString("format").contains("email-headline")

    lazy val isModified = isJson || isRss || isEmail

    lazy val pathWithoutModifiers: String =
      if (isEmail) r.path.stripSuffix(EMAIL_SUFFIX)
      else         r.path.stripSuffix("/all")

    lazy val hasParameters: Boolean = r.queryString.nonEmpty

    lazy val isHealthcheck: Boolean = r.headers.keys.exists(_ equalsIgnoreCase "X-Gu-Management-Healthcheck") || r.path == "/_healthcheck"

    lazy val rawQueryStringOption: Option[String] = if (r.rawQueryString.nonEmpty) Some(r.rawQueryString) else None

    //This is a header reliably set by jQuery for AJAX requests used in facia-tool
    lazy val isXmlHttpRequest: Boolean = r.headers.get("X-Requested-With").contains("XMLHttpRequest")

    lazy val isCrosswordFront: Boolean = r.path.endsWith("/crosswords")

    lazy val campaignCode: Option[String] = r.getQueryString("CMP")

    lazy val isAdFree: Boolean = r.headers.keys.exists(_ equalsIgnoreCase "X-Gu-Commercial-Ad-Free")

    lazy val referrer: Option[String] = r.headers.get("referer")
  }
}

object Requests extends Requests
