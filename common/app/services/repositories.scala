package services

import common.{Logging, ExecutionContexts}
import scala.concurrent.Future
import com.gu.contentapi.client.GuardianContentApiError

trait ConciergeRepository extends ExecutionContexts with Logging {
  implicit class future2RecoverApi404With[T](response: Future[T]) {
    def recoverApi404With(t: T) = response.recover {
      case GuardianContentApiError(404, message) =>
        log.info(s"Got a 404 while calling content api: $message")
        t
    }
  }
}
