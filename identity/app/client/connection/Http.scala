package client.connection

import scala.io.Codec
import client.Parameters


// Contract for HTTP implementations, fulfilled by the provided lib implementations, or your own
trait Http {
  implicit val codec = Codec("UTF-8")
  def GET(url: String, urlParameters: Parameters = Nil, headers: Parameters = Nil): HttpResponse
  def POST(url: String, body: String, urlParameters: Parameters = Nil, headers: Parameters = Nil): HttpResponse
  def DELETE(url: String, body: Option[String] = None, urlParameters: Parameters = Nil, headers: Parameters = Nil): HttpResponse
}
