package util

import common.ExecutionContexts

import scala.concurrent.Future
import scala.util.{Failure, Success}

object Futures extends ExecutionContexts {
  implicit class RichFuture[A](future: Future[A]) {
    def mapTry = future.map(Success.apply) recover { case error => Failure(error) }
  }
}
