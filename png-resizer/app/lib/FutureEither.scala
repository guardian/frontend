package lib

import common.StopWatch
import grizzled.slf4j.Logging
import metrics.FrontendTimingMetric
import play.api.mvc.Result

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}
import scalaz.{EitherT, Monad}

object FutureEither {

  implicit val future = new Monad[Future] {
    def point[A](a: => A): Future[A] = Future.successful(a)

    def bind[A, B](fa: Future[A])(f: A => Future[B]): Future[B] = fa flatMap f
  }

  type FutureEither[T] = EitherT[Future, Result, T]

}

object Time extends Logging {

  def apply[T](result: => Future[T], action: String, metric: FrontendTimingMetric): Future[T] = {
    val stopWatch = new StopWatch
    val resultEvaluated = result
    resultEvaluated.onComplete({ result =>
      metric.recordDuration(stopWatch.elapsed)
      result match {
        case Success(contents) =>
          logger.info(s"took: $stopWatch for: $action result: $contents")
        case Failure(exception) =>
          logger.info(s"took: $stopWatch for: $action failure: $exception")
      }
    })
    resultEvaluated
  }

}
