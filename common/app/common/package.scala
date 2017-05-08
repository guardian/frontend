package common

import java.util.concurrent.TimeoutException

import akka.pattern.CircuitBreakerOpenException
import com.gu.contentapi.client.GuardianContentApiError
import com.gu.contentapi.client.model.v1.ErrorResponse
import conf.switches.Switch
import conf.switches.Switches.InlineEmailStyles
import model.Cached.RevalidatableResult
import model.{ApplicationContext, Cached, NoCache}
import org.apache.commons.lang.exception.ExceptionUtils
import play.api.Logger
import play.api.mvc.{RequestHeader, Result}
import play.twirl.api.Html

object `package` extends implicits.Strings with implicits.Requests with play.api.mvc.Results {

  def isCommercialExpiry(error: ErrorResponse): Boolean = {
    error.message == "The requested resource has expired for commercial reason."
  }

  def convertApiExceptions[T](implicit request: RequestHeader,
                              context: ApplicationContext,
                              log: Logger): PartialFunction[Throwable, Either[T, Result]] = {

    convertApiExceptionsWithoutEither.andThen(Right(_))
  }

  def convertApiExceptionsWithoutEither[T](implicit request: RequestHeader,
                                           context: ApplicationContext,
                                           log: Logger): PartialFunction[Throwable, Result] = {
    case _: CircuitBreakerOpenException =>
      log.error(s"Got a circuit breaker open error while calling content api")
      NoCache(ServiceUnavailable)
    case GuardianContentApiError(404, message, _) =>
      log.info(s"Got a 404 while calling content api: $message")
      NoCache(NotFound)
    case GuardianContentApiError(410, message, errorResponse) =>
      errorResponse match {
        case Some(errorResponse) if isCommercialExpiry(errorResponse) =>
          log.info(s"Got a 410 while calling content api: $message: ${errorResponse.message}")
          Cached(60)(RevalidatableResult.Ok(views.html.commercialExpired()))
        case _ =>
          log.info(s"Got a 410 while calling content api: $message")
          NoCache(Gone)
      }
    case timeout: TimeoutException =>
      log.info(s"Got a timeout while calling content api: ${timeout.getMessage}")
      NoCache(GatewayTimeout(timeout.getMessage))
    case error =>
      log.info(s"Content api exception: ${error.getMessage}")
      log.info(s"Content api stack trace: ${ExceptionUtils.getStackTrace(error)}")
      Option(error.getCause).map { cause =>
        log.info(s"Content api exception cause: ", cause)
      }
      NoCache(InternalServerError)
  }

  /*
    NOTE: The htmlResponse & jsonResponse are () => Html functions so that you do not do all the rendering twice.
          Only the once you actually render is used
   */

  def renderFormat(htmlResponse: () => Html, jsonResponse: () => Html, page: model.Page)(implicit request: RequestHeader): Result =
    Cached(page) {
      if (request.isJson)
        JsonComponent(jsonResponse())
      else if (request.isEmail)
        RevalidatableResult.Ok(if (InlineEmailStyles.isSwitchedOn) InlineStyles(htmlResponse()) else htmlResponse())
      else
        RevalidatableResult.Ok(htmlResponse())
    }

  def renderFormat(htmlResponse: () => Html, jsonResponse: () => Html, page: model.Page, switches: Seq[Switch])(implicit request: RequestHeader, context: ApplicationContext): Result =
    Cached(page) {
      if (request.isJson)
        JsonComponent(page, jsonResponse())
      else if (request.isEmail)
        RevalidatableResult.Ok(if (InlineEmailStyles.isSwitchedOn) InlineStyles(htmlResponse()) else htmlResponse())
      else
        RevalidatableResult.Ok(htmlResponse())
    }

  def renderFormat(htmlResponse: () => Html, jsonResponse: () => Html, cacheTime: Integer)(implicit request: RequestHeader, context: ApplicationContext): Result =
    Cached(cacheTime) {
      if (request.isJson)
        JsonComponent(jsonResponse())
      else if (request.isEmail)
        RevalidatableResult.Ok(if (InlineEmailStyles.isSwitchedOn) InlineStyles(htmlResponse()) else htmlResponse())
      else
        RevalidatableResult.Ok(htmlResponse())
    }

  def renderFormat(html: () => Html, cacheTime: Integer)(implicit request: RequestHeader, context: ApplicationContext): Result = {
    renderFormat(html, html, cacheTime)
  }
}


