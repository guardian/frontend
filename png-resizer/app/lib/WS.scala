package lib

import play.api.libs.ws

import scala.language.reflectiveCalls

object WS {
  implicit class RichResponse(response: ws.WSResponseHeaders) {
    lazy val contentType: String = response.headers.get("Content-Type").map(_ mkString " ").getOrElse("")
    def getHeaders(allowedHeaders: Seq[String]): Seq[(String, String)] = {
      val copiedHeaders = response.headers.filterKeys(allowedHeaders.contains)
      copiedHeaders.flatMap { case (headerName, values) => values.map(value => (headerName, value))}.toSeq
    }

  }
}
