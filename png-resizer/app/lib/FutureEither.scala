package lib

import common.StopWatch
import grizzled.slf4j.Logging
import lib.FutureEither._
import metrics.FrontendTimingMetric
import play.api.mvc.Result

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scalaz.EitherT._
import scalaz.{EitherT, Monad, \/-}

object FutureEither {

  implicit val futureMonad = new Monad[Future] {
    def point[A](a: => A): Future[A] = Future.successful(a)

    def bind[A, B](fa: Future[A])(f: A => Future[B]): Future[B] = fa flatMap f
  }

  type FutureEither[T] = EitherT[Future, Result, T]

  def eitherTRight[T](future: Future[T]): FutureEither[T] =
    eitherT(future.map(\/-.apply))

}

object Time extends Logging {

  def apply[T](result: => FutureEither[T], action: String, metric: FrontendTimingMetric) = {
    val stopWatch = new StopWatch
    result.bimap({
      contents =>
        logger.info(s"took: $stopWatch for: $action result: Left($contents)")
        contents
    },
    {
      contents =>
        logger.info(s"took: $stopWatch for: $action result: Right($contents)")
        contents
    })
    metric.recordDuration(stopWatch.elapsed)
    result
  }

}
