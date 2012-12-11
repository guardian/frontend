package implicits

import play.api.mvc.RequestHeader

trait Requests {
  implicit def request2rich(r: RequestHeader) = new {
    def getParameter(name: String): Option[String] = r.queryString.get(name).flatMap(_.headOption)
    def getIntParameter(name: String): Option[Int] = getParameter(name).map(_.toInt)
    def getBooleanParameter(name: String): Option[Boolean] = getParameter(name).map(_.toBoolean)
  }
}