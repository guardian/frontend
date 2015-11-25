package services

import com.gu.contentapi.client.GuardianContentApiError
import common.{ExecutionContexts, Logging}

import scala.concurrent.Future

trait ConciergeRepository extends ExecutionContexts with Logging {
  implicit class future2RecoverApi404With[T](response: Future[T]) {
    def recoverApi404With(t: T) = response.recover {
      case GuardianContentApiError(404, message, _) =>
        log.info(s"Got a 404 while calling content api: $message")
        t
    }
  }
}
