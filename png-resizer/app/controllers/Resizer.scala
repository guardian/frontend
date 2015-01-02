package controllers

import conf.PngResizerMetrics
import data.Backends
import grizzled.slf4j.Logging
import lib.FutureEither._
import lib.HeadersImplicits._
import lib.Streams._
import lib.WS._
import lib.{Im4Java, IntString, PngQuant, Time}
import load.LoadLimit
import play.api.Play.current
import play.api.libs.iteratee.Enumerator
import play.api.libs.ws.WS
import play.api.mvc.{Action, Controller, Headers}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scalaz.EitherT._
import scalaz._

object Resizer extends Controller with Logging {

  case class CacheableContent(cacheHeaders: CacheHeaderList, content: Array[Byte])

  def getPngBytesToResize(uri: String, response: PngResponse): FutureEither[CacheableContent] = eitherT {
    val PngResponse(status, contentType, cacheHeaders, enumerator) = response
    status match {

      case OK if contentType == "image/png" && cacheHeaders.toMap.contains("Last-Modified") =>
        enumerator.toByteArray.map(bytes => \/-(CacheableContent(cacheHeaders, bytes)))

      case NOT_MODIFIED =>
        PngResizerMetrics.notModifiedCount.increment
        Future.successful(-\/(NotModified.withHeaders(cacheHeaders: _*)))

      case OK if contentType == "image/png" =>
        Future.successful(-\/(BadRequest(s"Original image $uri did not send exactly one last-modified header (${cacheHeaders.toMap.get("Last-Modified")}}). This prevents caching.")))

      case OK =>
        Future.successful(-\/(BadRequest(s"Original image $uri content type (${contentType}) is not " +
          "supported. Only PNG supported.")))

      case NOT_FOUND => Future.successful(-\/(NotFound(s"Unable to find source image at $uri")))

      case otherErrorCode => Future.successful(-\/(BadGateway(s"Received $otherErrorCode for $uri")))
    }
  }

  case class PngResponse(status: Int, contentType: String, cacheHeaders: CacheHeaderList, body: Enumerator[Array[Byte]])
  type CacheHeaderList = Seq[(String, String)]

  def getUpstreamResponse(uri: String, headers: Headers): FutureEither[PngResponse] = eitherTRight {
    val unrolledHeaders = headers.getHeaders(Seq("Cache-Control", "If-Modified-Since", "If-None-Match"))
    WS.url(uri).withHeaders(unrolledHeaders: _*).getStream().map {
      case (headers, enumerator) =>
        PngResponse(headers.status, headers.contentType, headers.getHeaders(Seq("Cache-Control", "Expires", "Last-Modified", "Etag")), enumerator)
    }
  }

  def resize(backend: String, path: String, widthString: String, qualityString: String) =
    Action.async { request =>

      (Backends.uri(backend, path), widthString, qualityString) match {
        case (Some(uri), IntString(width), IntString(quality)) =>
          LoadLimit(uri) {

            // Left here is the http result, right is the data that still needs computation
            (for {
              response <- Time(getUpstreamResponse(uri, request.headers), "download image", PngResizerMetrics.downloadTime)
              cacheableContent <- getPngBytesToResize(uri, response)
              CacheableContent(cacheHeaders, bytesPreResize) = cacheableContent
              resized <- Time(eitherTRight(Im4Java.resizeBufferedImage(width)(bytesPreResize)), "resize image", PngResizerMetrics.resizeTime)
              quanted <- Time(eitherTRight(PngQuant(resized, quality)), "quantize image", PngResizerMetrics.quantizeTime)
              result = Ok(quanted).as("image/png").withHeaders(cacheHeaders: _*)
            } yield (result)).run.map(_.fold(identity,identity))

          }

        case (None, _, _) => Future.successful(NotFound(s"$backend is not a backend we support"))

        case _ => Future.successful(BadRequest(s"width and quality must be integers"))
      }
    }

}
