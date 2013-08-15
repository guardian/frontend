package client.connection

import scala.io.Codec
import client.{Logging, Parameters, Error, Response}
import scala.concurrent.Future


// Contract for HTTP implementations, fulfilled by the provided lib implementations, or your own
trait Http extends Logging {
  implicit val codec = Codec("UTF-8")

  protected def formatParams(params: Parameters) = params.map {
    case (k, v) => "%s=%s".format(k, v)
  }.mkString("&")

  def GET(url: String, urlParameters: Parameters = Nil, headers: Parameters = Nil): Future[Response[HttpResponse]]

  def POST(url: String, body: Option[String], urlParameters: Parameters = Nil, headers: Parameters = Nil): Future[Response[HttpResponse]]

  def DELETE(url: String, body: Option[String] = None, urlParameters: Parameters = Nil, headers: Parameters = Nil): Future[Response[HttpResponse]]
}
