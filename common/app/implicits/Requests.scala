package implicits

import common.Edition
import play.api.mvc.RequestHeader

trait Requests {



  implicit class RichRequestHeader(r: RequestHeader) {

    def getParameter(name: String): Option[String] = r.queryString.get(name).flatMap(_.headOption)

    def getParameters(name: String): Seq[String] = r.queryString.getOrElse(name, Nil)

    def getIntParameter(name: String): Option[Int] = getParameter(name).map(_.toInt)

    def getBooleanParameter(name: String): Option[Boolean] = getParameter(name).map(_.toBoolean)

    lazy val isJson: Boolean = r.getQueryString("callback").isDefined || r.path.endsWith(".json")

    lazy val isRss: Boolean = r.path.endsWith("/rss")

    lazy val isAmp: Boolean = r.path.endsWith("/amp")

    lazy val pathWithoutModifiers: String = if (isAmp) r.path.stripSuffix("/amp") else r.path.stripSuffix("/all")

    lazy val hasParameters: Boolean = r.queryString.nonEmpty

    lazy val isHealthcheck: Boolean = r.headers.keys.exists(_ equalsIgnoreCase "X-Gu-Management-Healthcheck")

    lazy val rawQueryStringOption: Option[String] = if (r.rawQueryString.nonEmpty) Some(r.rawQueryString) else None

    private val networkFronts = Edition.all.map(_.id).map(id => s"/$id")

    // see http://docs.aws.amazon.com/ElasticLoadBalancing/latest/DeveloperGuide/TerminologyandKeyConcepts.html#x-forwarded-proto
    lazy val isSecure: Boolean = r.headers.get("X-Forwarded-Proto").exists(_.equalsIgnoreCase("https")) || isAmp // TODO tidyup - remove isAmp when amp is served over https anyway

    //This is a header reliably set by jQuery for AJAX requests used in facia-tool
    lazy val isXmlHttpRequest: Boolean = r.headers.get("X-Requested-With").contains("XMLHttpRequest")

    lazy val isCrosswordFront: Boolean = r.path.endsWith("/crosswords")
  }
}

object Requests extends Requests
