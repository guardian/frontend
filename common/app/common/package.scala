package common

import com.gu.openplatform.contentapi.ApiError
import play.api.Logger
import play.api.mvc.Result

object `package` extends implicits.Strings with implicits.Requests with play.api.mvc.Results {

  def suppressApi404[T](block: => Option[T])(implicit log: Logger): Option[T] = {
    try {
      block
    } catch {
      case ApiError(404, message) =>
        log.info(s"Got a 404 while calling content api: $message")
        None
    }
  }

  def suppressApi404[T](block: => Either[T, Result])(implicit log: Logger): Either[T, Result] = {
    try {
      block
    } catch {
      case ApiError(404, message) =>
        log.info(s"Got a 404 while calling content api: $message")
        Right(NotFound)
    }
  }

  def quietly[A](block: => A)(implicit log: Logger) = try {
    block
  } catch {
    case e: Throwable => log.error(s"Failing quietly on: ${e.getMessage}", e)
  }

  def quietlyWithDefault[A](default: A)(block: => A)(implicit log: Logger) = try {
    block
  } catch {
    case e: Throwable =>
      log.error(s"Failing quietly on: ${e.getMessage}", e)
      default
  }
}

object Reference {
  def apply(s: String) = {
    val parts = s.split("/")
    parts(0) -> parts(1)
  }
}
