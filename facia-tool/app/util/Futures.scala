package util

import scala.concurrent.Future
import scala.util.{Failure, Success}
import common.ExecutionContexts

object Futures extends ExecutionContexts {
  implicit class RichFuture[A](future: Future[A]) {
    def mapTry = future.map(Success.apply) recover { case error => Failure(error) }
  }
}
