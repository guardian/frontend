package controllers

import common.StopWatch
import conf.{Configuration, PngResizerMetrics}
import data.Backends
import grizzled.slf4j.Logging
import lib.Streams._
import lib.WS._
import lib.{Im4Java, IntString, PngQuant}
import load.LoadLimit
import model.Cached
import play.api.Play.current
import play.api.libs.ws.WS
import play.api.mvc.{Action, Controller}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object Resizer extends Controller with Logging {
  def resize(backend: String, path: String, widthString: String, qualityString: String) =
    Action.async {
      val downloadStopWatch = new StopWatch

      (Backends.uri(backend, path), widthString, qualityString) match {
        case (Some(uri), IntString(width), IntString(quality)) =>
          LoadLimit(uri) {
            WS.url(uri).getStream() flatMap { case (responseHeaders, enumerator) =>
              responseHeaders.status match {
                case OK if responseHeaders.contentType != "image/png" =>
                  Future.successful(BadRequest(s"Original image $uri content type (${responseHeaders.contentType}) is not " +
                    "supported. Only PNG supported."))

                case OK =>
                  logger.info(s"Resizing $uri to $width pixels wide at $quality compression")

                  enumerator.toByteArray flatMap { bytes =>
                    logger.info(s"Took $downloadStopWatch to download $uri")
                    PngResizerMetrics.downloadTime.recordDuration(downloadStopWatch.elapsed)

                    val resizeStopWatch = new StopWatch

                    val resized = Im4Java.resizeBufferedImage(width)(bytes)
                    logger.info(s"Took $resizeStopWatch to IM convert (resize) $uri")
                    val quantStopWatch = new StopWatch
                    PngQuant(resized, quality) map { compressedImage =>
                      logger.info(s"Took $quantStopWatch to PngQuant $uri")
                      PngResizerMetrics.resizeTime.recordDuration(resizeStopWatch.elapsed)

                      Cached(Configuration.pngResizer.ttlInSeconds)(Ok(compressedImage).as("image/png"))
                    }

                  }

                case NOT_FOUND => Future.successful(NotFound(s"Unable to find source image at $uri"))

                case otherErrorCode => Future.successful(BadGateway(s"Received $otherErrorCode for $uri"))
              }
            }
          }

        case (None, _, _) => Future.successful(NotFound(s"$backend is not a backend we support"))

        case _ => Future.successful(BadRequest(s"width and quality must be integers"))
      }
    }
}
