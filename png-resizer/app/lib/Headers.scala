package lib

import play.api.mvc.Headers

import scala.language.reflectiveCalls

object HeadersImplicits {
  implicit class RichHeaders(headers: Headers) {
    def getHeaders(allowedHeaders: Seq[String]): Seq[(String, String)] = {
      val copiedHeaders = headers.toMap.filterKeys(allowedHeaders.contains)
      copiedHeaders.flatMap { case (headerName, values) => values.map(value => (headerName, value))}.toSeq
    }

  }
}
