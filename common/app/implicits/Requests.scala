package implicits

import play.api.mvc.RequestHeader

trait Requests {
  implicit class Request2rich(r: RequestHeader) {
    def getParameter(name: String): Option[String] = r.queryString.get(name).flatMap(_.headOption)
    def getIntParameter(name: String): Option[Int] = getParameter(name).map(_.toInt)
    def getBooleanParameter(name: String): Option[Boolean] = getParameter(name).map(_.toBoolean)
  }
}