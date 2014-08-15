package common

import com.gu.openplatform.contentapi.ApiError
import conf.Switch
import play.api.Logger
import play.api.mvc.{ Result, RequestHeader }
import play.twirl.api.Html
import model.{NoCache, Cached}
import java.util.concurrent.TimeoutException

object `package` extends implicits.Strings with implicits.Requests with play.api.mvc.Results {


  def convertApiExceptions[T](implicit log: Logger): PartialFunction[Throwable, Either[T, Result]] = {
    case ApiError(404, message) =>
      log.info(s"Got a 404 while calling content api: $message")
      Right(NoCache(NotFound))
    case ApiError(410, message) =>
      log.info(s"Got a 410 while calling content api: $message")
      Right(NoCache(Gone))
    case timeout: TimeoutException =>
      log.info(s"Got a timeout while calling content api: ${timeout.getMessage}")
      Right(NoCache(GatewayTimeout(timeout.getMessage)))
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

  def renderFormat(htmlResponse: () => Html, jsonResponse: () => Html, metaData: model.MetaData, switches: Seq[Switch])(implicit request: RequestHeader) = Cached(metaData) {
    if (request.isJson)
      JsonComponent(metaData, jsonResponse())
    else
      Ok(htmlResponse())
  }

  def renderFormat(htmlResponse: () => Html, jsonResponse: () => Html, cacheTime: Integer)(implicit request: RequestHeader) = Cached(cacheTime) {
    if (request.isJson)
      JsonComponent(jsonResponse())
    else
      Ok(htmlResponse())
  }

  def renderFormat(html: () => Html, cacheTime: Integer)(implicit request: RequestHeader): Result = {
    renderFormat(html, html, cacheTime)(request)
  }
}

object Reference {
  def apply(s: String) = {
    val parts = s.split("/")
    parts(0) -> parts.drop(1).mkString("/")
  }
}
