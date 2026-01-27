package services

import com.gu.contentapi.client.model.ContentApiError
import common.GuLogging

import scala.concurrent.{ExecutionContext, Future}

trait ConciergeRepository extends GuLogging {
  implicit val executionContext: ExecutionContext
  implicit class future2RecoverApi404With[T](response: Future[T]) {
    def recoverApi404With(t: T): Future[T] =
      response.recover { case ContentApiError(404, message, _) =>
        log.info(s"Got a 404 while calling content api: $message")
        t
      }
  }
}
