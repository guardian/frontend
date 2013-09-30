package services

import common.{Logging, ExecutionContexts}
import scala.concurrent.Future
import com.gu.openplatform.contentapi.ApiError

trait Concierge extends ExecutionContexts with Logging {
  implicit class future2RecoverApi404With[T](response: Future[T]) {
    def recoverApi404With(t: T) = response.recover {
      case ApiError(404, message) =>
        log.info(s"Got a 404 while calling content api: $message")
        t
    }
  }
}