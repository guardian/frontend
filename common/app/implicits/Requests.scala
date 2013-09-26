package implicits

import play.api.mvc.RequestHeader

trait Requests {
  implicit class Request2rich(r: RequestHeader) {

    def getParameter(name: String): Option[String] = r.queryString.get(name).flatMap(_.headOption)

    def getIntParameter(name: String): Option[Int] = getParameter(name).map(_.toInt)

    def getBooleanParameter(name: String): Option[Boolean] = getParameter(name).map(_.toBoolean)

    lazy val isJson = r.getQueryString("callback").isDefined || r.headers.get("Accept").exists{ header =>
      header.contains("application/json") ||
      header.contains("text/javascript") ||
      header.contains("application/javascript")
    } || r.path.endsWith(".json")

    lazy val hasParameters = !r.queryString.isEmpty
  }
}