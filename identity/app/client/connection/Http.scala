package client.connection

import scala.io.Codec
import client.{Logging, Parameters, Error, Response}


// Contract for HTTP implementations, fulfilled by the provided lib implementations, or your own
trait Http extends Logging {
  implicit val codec = Codec("UTF-8")

  private def formatParams(params: Parameters) = params.map {
    case (k, v) => "%s, %s".format(k, v)
  }.mkString(",")

  protected def doGET(url: String, urlParameters: Parameters = Nil, headers: Parameters = Nil): Response[HttpResponse]
  def GET(url: String, urlParameters: Parameters = Nil, headers: Parameters = Nil): Response[HttpResponse] = {
    logger.trace("GET request %s; params: %s; headers: %s".format(url, formatParams(urlParameters), formatParams(headers)))
    doGET(url, urlParameters, headers)
  }

  protected def doPOST(url: String, body: String, urlParameters: Parameters = Nil, headers: Parameters = Nil): Response[HttpResponse]
  def POST(url: String, body: String, urlParameters: Parameters = Nil, headers: Parameters = Nil): Response[HttpResponse] = {
    logger.trace("POST request %s; body: %s; params: %s; headers: %s".format(url, body, formatParams(urlParameters), formatParams(headers)))
    doPOST(url, body, urlParameters, headers)
  }

  protected def doDELETE(url: String, body: Option[String] = None, urlParameters: Parameters = Nil, headers: Parameters = Nil): Response[HttpResponse]
  def DELETE(url: String, body: Option[String] = None, urlParameters: Parameters = Nil, headers: Parameters = Nil): Response[HttpResponse] = {
    logger.trace("DELETER request %s; body: %s; params: %s; headers: %s".format(url, body.toString, formatParams(urlParameters), formatParams(headers)))
    doDELETE(url, body, urlParameters, headers)
  }
}
