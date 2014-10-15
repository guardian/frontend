package controllers

import java.io.InputStream

import org.apache.commons.io.IOUtils
import play.api.mvc.{Controller, Action}
import data.Backends
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.libs.ws.WS
import play.api.Play.current
import lib.WS._
import lib.Streams._
import grizzled.slf4j.Logging
import lib.Im4Java
import lib.CacheHeaders._
import org.joda.time.Duration
import conf.PngResizerConfiguration

object Resizer extends Controller with Logging {
  def resize(backend: String, path: String, width: Int, quality: Int) = Action.async {
    Backends.uri(backend, path) match {
      case Some(uri) => WS.url(uri).get() map { response =>
        response.status match {
          case OK if response.contentType != "image/png" =>
            BadRequest(s"Original image $uri content type (${response.contentType}) is not supported. Only PNG " +
              s"supported.")

          case OK =>
            logger.info(s"Resizing $uri to $width pixels wide at $quality compression")

            val image = IOUtils.toInputStream(response.body).toBufferedImage
            val resized = Im4Java.resizeBufferedImage(image, width, quality)

            Ok(resized).as("image/png").withTimeToLive(
              Duration.standardSeconds(PngResizerConfiguration.ttlInSeconds)
            )

          case NOT_FOUND => NotFound(s"Unable to find source image at $uri")

          case otherErrorCode => BadGateway(s"Received $otherErrorCode for $uri")
        }
      }

      case None => Future.successful(NotFound(s"$backend is not a backend we support"))
    }
  }
}
