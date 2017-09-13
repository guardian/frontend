package services

import com.gu.contentapi.client.GuardianContentApiError
import common.Logging

import scala.concurrent.{ExecutionContext, Future}

trait ConciergeRepository extends Logging {
  implicit val executionContext: ExecutionContext
  implicit class future2RecoverApi404With[T](response: Future[T]) {
    def recoverApi404With(t: T): Future[T] = response.recover {
      case GuardianContentApiError(404, message, _) =>
        log.info(s"Got a 404 while calling content api: $message")
        t
    }
  }
}
