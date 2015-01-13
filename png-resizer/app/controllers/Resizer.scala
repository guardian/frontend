package controllers

import common.Logging
import conf.PngResizerMetrics
import data.Backends
import lib.FutureEither._
import lib.HeadersImplicits._
import lib.Streams._
import lib.WS._
import lib.{Im4Java, IntString, PngQuant, Time}
import load.LoadLimit
import model.Cached
import play.api.Play.current
import play.api.libs.iteratee.Enumerator
import play.api.libs.ws.WS
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.duration._
import scalaz._

object Resizer extends Controller with Logging with implicits.Requests {

  case class CacheableContent(cacheHeaders: CacheHeaderList, content: Array[Byte])

  def getPngBytesToResize(uri: String, response: PngResponse) = {
    val PngResponse(status, contentType, cacheHeaders, enumerator) = response
    status match {

      case OK if contentType == "image/png" && cacheHeaders.toMap.contains("Last-Modified") =>
        enumerator.toByteArray.map(bytes => \/-(CacheableContent(cacheHeaders, bytes)))

      case NOT_MODIFIED =>
        PngResizerMetrics.notModifiedCount.increment()
        future.point(-\/(NotModified.withHeaders(cacheHeaders: _*)))

      case OK if contentType == "image/png" =>
        future.point(-\/(BadRequest(s"Original image $uri did not send exactly one last-modified header (${cacheHeaders.toMap.get("Last-Modified")}}). This prevents caching.")))

      case OK =>
        future.point(-\/(BadRequest(s"Original image $uri content type ($contentType) is not " +
          "supported. Only PNG supported.")))

      case NOT_FOUND => future.point(-\/(NotFound(s"Unable to find source image at $uri")))

      case otherErrorCode => future.point(-\/(BadGateway(s"Received $otherErrorCode for $uri")))
    }
  }

  case class PngResponse(status: Int, contentType: String, cacheHeaders: CacheHeaderList, body: Enumerator[Array[Byte]])
  type CacheHeaderList = Seq[(String, String)]

  def getUpstreamResponse(uri: String, requestHeaders: Headers): Future[PngResponse] = {
    val unrolledHeaders = requestHeaders.getHeaders(Seq("Cache-Control", "If-Modified-Since", "If-None-Match"))
    WS.url(uri).withHeaders(unrolledHeaders: _*).getStream().map {
      case (headers, enumerator) =>
        PngResponse(headers.status, headers.contentType, headers.getHeaders(Seq("Cache-Control", "Expires", "Last-Modified", "Etag")), enumerator)
    }
  }

  def redirectScaleUpAttempts(originalWidth: Int, width: Int, fallbackUri: String) = {
    if (originalWidth <= width) {
      PngResizerMetrics.wontMakeBiggerCount.increment()
      log.info(s"won't resize image to be bigger - $originalWidth to $width - redirecting to original")
      -\/(Cached(1.day)(Found(fallbackUri)))
    } else {
      \/-(())
    }
  }

  // if we have too many pixels, it takes too long to resize.  This could be tweaked.
  val MAX_PIXELS = 620 * 480

  def redirectTooBigAttempts(originalWidth: Int, originalHeight: Int, requestedWidth: Int, fallbackUri: String) = {
    val requestedPixels = (originalHeight.toLong * requestedWidth * requestedWidth) / originalWidth
    if (requestedPixels > MAX_PIXELS) {
      PngResizerMetrics.tooHardCount.increment()
      log.info(s"won't resize if final image will be too big afterwards - total size $requestedPixels - redirecting to original")
      -\/(Cached(1.day)(Found(fallbackUri)))
    } else {
      \/-(())
    }
  }

  def resize(backend: String, path: String, widthString: String, qualityString: String) =
    Action.async { request =>

      (Backends.uri(backend, path), widthString, qualityString) match {
        case (Some(uri), IntString(width), IntString(quality)) =>

          // Left here is the http result, right is the data that still needs computation
          val resultEitherT = for {
            response <- EitherT.right(Time(getUpstreamResponse(uri, request.headers), "download image", PngResizerMetrics.downloadTime))
            cacheableContent <- EitherT(getPngBytesToResize(uri, response))
            CacheableContent(cacheHeaders, bytesPreResize) = cacheableContent
            originalSize <- EitherT.right(Im4Java.getWidth(bytesPreResize))
            (originalWidth, originalHeight) = originalSize
            _ <- EitherT(future.point(redirectScaleUpAttempts(originalWidth, width, uri)))
            _ <- EitherT(future.point(redirectTooBigAttempts(originalWidth, originalHeight, width, uri)))
            processed <- EitherT(resizeWithLoadLimit(request, uri, width, quality, bytesPreResize))
            result = Ok(processed).as("image/png").withHeaders(cacheHeaders: _*)
          } yield result

          resultEitherT.fold(identity, identity)

        case (None, _, _) => future.point(NotFound(s"$backend is not a backend we support"))

        case _ => future.point(BadRequest(s"width and quality must be integers"))
      }
    }

  def resizeWithLoadLimit(request: Request[AnyContent], uri: String, width: Int, quality: Int, bytesPreResize: Array[Byte]): Future[Result \/ Array[Byte]] = {
    LoadLimit.tryOperation[Result \/ Array[Byte]](request.isHealthcheck) {
      resizePngBytes(width, quality, bytesPreResize).map(\/-.apply)
    } {
      noCapacity(request, uri)
    }
  }

  def noCapacity(request: Request[AnyContent], uri: String) = {
    log.info(s"too many requests - redirecting to $uri")
    if (!request.isHealthcheck) {
      PngResizerMetrics.redirectCount.increment()
    }
    future.point(-\/(Cached(60)(Found(uri))))
  }

  def resizePngBytes(width: Int, quality: Int, bytesPreResize: Array[Byte]): Future[Array[Byte]] = {
    for {
      resized <- Time(Im4Java.resizeBufferedImage(width)(bytesPreResize), "resize image", PngResizerMetrics.resizeTime)
      quanted <- Time(PngQuant(resized, quality), "quantize image", PngResizerMetrics.quantizeTime)
    } yield quanted
  }
}
