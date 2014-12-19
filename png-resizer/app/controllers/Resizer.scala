package controllers

import common.StopWatch
import conf.Configuration
import data.Backends
import grizzled.slf4j.Logging
import lib.Streams._
import lib.WS._
import lib.{Im4Java, ImageCache, IntString, PngQuant}
import model.Cached
import play.api.Play.current
import play.api.libs.iteratee.Enumerator
import play.api.libs.ws.{WS, WSResponseHeaders}
import play.api.mvc.{Action, Controller, Result}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scalaz.EitherT._
import scalaz._

object Resizer extends Controller with Logging {

  implicit val futureMonad = new Monad[Future] {
    def point[A](a: => A): Future[A] = Future.successful(a)
    def bind[A, B](fa: Future[A])(f: A => Future[B]): Future[B] = fa flatMap f
  }

  def getPngBytes(uri: String, response: (WSResponseHeaders, Enumerator[Array[Byte]])): Future[\/[Result, Array[Byte]]] = {
    val (responseHeaders, enumerator) = response
      responseHeaders.status match {
        case OK if responseHeaders.contentType != "image/png" =>
          Future.successful(-\/(BadRequest(s"Original image $uri content type (${responseHeaders.contentType}) is not " +
            "supported. Only PNG supported.")))

        case OK =>

          enumerator.toByteArray.map(\/-.apply)

        case NOT_FOUND => Future.successful(-\/(NotFound(s"Unable to find source image at $uri")))

        case otherErrorCode => Future.successful(-\/(BadGateway(s"Received $otherErrorCode for $uri")))
      }
  }

  def getImage(path: String, meta: String): Future[Result \/ Unit] = {
    ImageCache.getImage(path, meta).map { maybeCached =>
      maybeCached match {
        case Some(compressedImage) =>
          // TODO should store metric about misses:hits ratio?
          -\/(Cached(Configuration.pngResizer.ttlInSeconds)(Ok(compressedImage).as("image/png")))
        case None =>
          \/-(())
      }
    }
  }

  def putImage(path: String, meta: String, data: Array[Byte]): Future[Result \/ Unit] = {
    ImageCache.putImage(path, meta, data).onFailure {
      case t => logger.warn("couldn't store in image cache", t)
        // TODO need to flag on some metric?
    }
    // if it fails, don't care (?)
    Future.successful(\/-(()))
  }

  type FutureEither[T] = EitherT[Future, Result, T]

  def eitherTRight[T](future: Future[T]): FutureEither[T] =
    eitherT(future.map(\/-.apply))

  def time[T](result: => FutureEither[T], action: String) = {
    val downloadStopWatch = new StopWatch
    result.bimap({
      contents =>
        logger.info(s"took: $downloadStopWatch for: $action result: Left($contents)")
        contents
    },
    {
      contents =>
        logger.info(s"took: $downloadStopWatch for: $action result: Right($contents)")
        contents
    })
    result
  }

  def resize(backend: String, path: String, widthString: String, qualityString: String) = Action.async {

    (Backends.uri(backend, path), widthString, qualityString) match {
      case (Some(uri), IntString(width), IntString(quality)) =>

        // TODO everything probably shouldn't be a Array[Byte] as that prevents streaming
        // Left here is the http result, right is the data that still needs computation
        (for {
          _ <- time(eitherT(getImage(path, s"$width/$quality")), "get cached image")
          response <- eitherTRight(WS.url(uri).getStream())
          bytesPreResize <- eitherT(getPngBytes(uri, response))
          resized <- time(eitherTRight(Im4Java.resizeBufferedImage(width)(bytesPreResize)), "resize image")
          quanted <- time(eitherTRight(PngQuant(resized, quality)), "quantize image")
          _ <- time(eitherT(putImage(path, s"$width/$quality", quanted)), "store image in cache")
          result = Cached(Configuration.pngResizer.ttlInSeconds)(Ok(quanted).as("image/png"))
        } yield (result)).run.map(_.fold(identity,identity))

      case (None, _, _) => Future.successful(NotFound(s"$backend is not a backend we support"))

      case _ => Future.successful(BadRequest(s"width and quality must be integers"))
    }
  }
}
