package common

import com.gu.openplatform.contentapi.ApiError
import play.api.Logger
import play.api.mvc.Result
import play.api.templates.Html
import model.Cached
import play.api.mvc.RequestHeader
import com.gu.management.Switchable

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


  /*
    NOTE: The htmlResponse & jsonResponse are () => Html functions so that you do not do all the rendering twice.
          Only the once you actually render is used
   */

  def renderFormat(htmlResponse: () => Html, jsonResponse: () => Html, metaData: model.MetaData)(implicit request: RequestHeader) = Cached(metaData) {
    if (request.isJson)
      JsonComponent(jsonResponse())
    else
      Ok(htmlResponse())
  }
  
  def renderFormat(htmlResponse: () => Html, jsonResponse: () => Html, metaData: model.MetaData, switches: Seq[Switchable])(implicit request: RequestHeader) = Cached(metaData) {
    if (request.isJson)
      JsonComponent(metaData, switches, jsonResponse())
    else
      Ok(htmlResponse())
  }
  
  def renderFormat(htmlResponse: () => Html, jsonResponse: () => Html, cacheTime: Integer)(implicit request: RequestHeader) = Cached(cacheTime) {
    if (request.isJson)
      JsonComponent(jsonResponse())
    else
      Ok(htmlResponse())
  }
}

object Reference {
  def apply(s: String) = {
    val parts = s.split("/")
    parts(0) -> parts.drop(1).mkString("/")
  }
}
