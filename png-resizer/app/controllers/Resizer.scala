package controllers

import java.io.ByteArrayInputStream
import common.StopWatch
import conf.{PngResizerMetrics, Configuration}
import model.Cached
import play.api.mvc.{Controller, Action}
import data.Backends
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.libs.ws.WS
import play.api.Play.current
import lib.WS._
import lib.Streams._
import lib.IntString
import grizzled.slf4j.Logging
import lib.Im4Java

object Resizer extends Controller with Logging {
  def resize(backend: String, path: String, widthString: String, qualityString: String) = Action.async {
    val downloadStopWatch = new StopWatch

    (Backends.uri(backend, path), widthString, qualityString) match {
      case (Some(uri), IntString(width), IntString(quality)) =>
        WS.url(uri).getStream() flatMap { case (responseHeaders, enumerator) =>
          responseHeaders.status match {
            case OK if responseHeaders.contentType != "image/png" =>
              Future.successful(BadRequest(s"Original image $uri content type (${responseHeaders.contentType}) is not " +
                "supported. Only PNG supported."))

            case OK =>
              logger.info(s"Resizing $uri to $width pixels wide at $quality compression")

              enumerator.toByteArray map { bytes =>
                logger.info(s"Downloaded $uri in $downloadStopWatch")
                PngResizerMetrics.downloadTime.recordDuration(downloadStopWatch.elapsed)

                val resizeStopWatch = new StopWatch

                val maybeImage = Option(new ByteArrayInputStream(bytes).toBufferedImage)

                maybeImage match {
                  case Some(image) =>
                    val resized = Im4Java.resizeBufferedImage(image, width, quality)

                    logger.info(s"Resized $uri in $resizeStopWatch")
                    PngResizerMetrics.resizeTime.recordDuration(resizeStopWatch.elapsed)

                    Cached(Configuration.pngResizer.ttlInSeconds)(Ok(resized).as("image/png"))

                  case None =>
                    InternalServerError(s"Could not convert $uri to a buffered image")
                }
              }

            case NOT_FOUND => Future.successful(NotFound(s"Unable to find source image at $uri"))

            case otherErrorCode => Future.successful(BadGateway(s"Received $otherErrorCode for $uri"))
          }
        }

      case (None, _, _) => Future.successful(NotFound(s"$backend is not a backend we support"))

      case _ => Future.successful(BadRequest(s"width and quality must be integers"))
    }
  }
}
