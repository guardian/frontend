package common

import com.gu.openplatform.contentapi.ApiError
import play.api.Logger
import play.api.mvc.Result
import play.api.libs.concurrent.Execution.Implicits._
import play.api.templates.Html
import model.Cached
import play.api.mvc.RequestHeader

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


  def suppressApiNotFound[T](implicit log: Logger): PartialFunction[Throwable, Either[T, Result]] = {
    case ApiError(404, message) =>
      log.info(s"Got a 404 while calling content api: $message")
      Right(NotFound)
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
  
  def renderFormat(htmlResponse: Html, jsonResponse: Html, metaData: model.MetaData)(implicit request: RequestHeader) = Cached(metaData) {
    request.getQueryString("callback").map { callback =>
      JsonComponent(jsonResponse)
    } getOrElse {
      Ok(Compressed(htmlResponse))
    }
  }
  
  def renderFormat(htmlResponse: Html, jsonResponse: Html, cacheTime: Integer)(implicit request: RequestHeader) = Cached(cacheTime) {
    request.getQueryString("callback").map { callback =>
      JsonComponent(jsonResponse)
    } getOrElse {
      Ok(Compressed(htmlResponse))
    }
  }
}

object Reference {
  def apply(s: String) = {
    val parts = s.split("/")
    parts(0) -> parts.drop(1).mkString("/")
  }
}
