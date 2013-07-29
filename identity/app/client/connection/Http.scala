package client.connection

import scala.language.higherKinds
import scala.io.Codec
import client.{Logging, Parameters, Error, Response}
import client.util.Id
import scala.concurrent.Future


// Contract for HTTP implementations, fulfilled by the provided lib implementations, or your own
trait Http[F[_]] extends Logging {
  implicit val codec = Codec("UTF-8")

  protected def formatParams(params: Parameters) = params.map {
    case (k, v) => "%s, %s".format(k, v)
  }.mkString(",")

  def GET(url: String, urlParameters: Parameters = Nil, headers: Parameters = Nil): F[Response[HttpResponse]]

  def POST(url: String, body: String, urlParameters: Parameters = Nil, headers: Parameters = Nil): F[Response[HttpResponse]]

  def DELETE(url: String, body: Option[String] = None, urlParameters: Parameters = Nil, headers: Parameters = Nil): F[Response[HttpResponse]]
}

trait SyncronousHttp extends Http[Id]
trait AsyncronousHttp extends Http[Future]
