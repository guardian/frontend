package common

import java.util.concurrent.TimeoutException
import com.gu.contentapi.client.model.ContentApiError
import com.gu.contentapi.client.model.v1.ErrorResponse
import conf.switches.Switch
import conf.switches.Switches.InlineEmailStyles
import _root_.html.{BrazeEmailFormatter, HtmlTextExtractor}
import model.CacheTime.RecentlyUpdated
import model.Cached.RevalidatableResult
import model.{ApplicationContext, Cached, NoCache}
import play.api.Logger
import play.api.libs.json.{JsObject, JsString, JsValue}
import play.api.mvc.{RequestHeader, Result}
import play.twirl.api.Html
import http.ResultWithPreconnectPreload
import http.HttpPreconnections
import net.logstash.logback.marker.LogstashMarker
import net.logstash.logback.marker.Markers.append
import org.apache.pekko.pattern.CircuitBreakerOpenException
import renderers.{DCRLocalConnectException, DCRTimeoutException}

object `package`
    extends implicits.Strings
    with implicits.Requests
    with play.api.mvc.Results
    with ResultWithPreconnectPreload {

  def isCommercialExpiry(error: ErrorResponse): Boolean = {
    error.message == "The requested resource has expired for commercial reason."
  }

  def convertApiExceptions[T](implicit
      request: RequestHeader,
      context: ApplicationContext,
      log: Logger,
  ): PartialFunction[Throwable, Either[Result, T]] = {
    convertApiExceptionsWithoutEither.andThen(Left(_))
  }

  def convertApiExceptionsWithoutEither[T](implicit
      request: RequestHeader,
      context: ApplicationContext,
      log: Logger,
  ): PartialFunction[Throwable, Result] = {
    val requestId = request.headers.get("x-request-id").getOrElse("request-id-not-provided")
    val customFieldMarker: LogstashMarker = {
      append("requestId", requestId)
    }
    {
      case _: CircuitBreakerOpenException =>
        log.logger.error(
          customFieldMarker,
          s"Got a circuit breaker open error while calling content api, path: ${request.path}",
        )
        NoCache(ServiceUnavailable)
      case ContentApiError(404, message, _) =>
        log.logger.info(customFieldMarker, s"Got a 404 while calling content api: $message, path:${request.path}")
        NoCache(NotFound)
      case ContentApiError(410, message, errorResponse) =>
        errorResponse match {
          case Some(errorResponse) if isCommercialExpiry(errorResponse) =>
            log.logger.info(
              customFieldMarker,
              s"Got a 410 while calling content api: $message: ${errorResponse.message}, path: ${request.path}",
            )
            Cached(60)(RevalidatableResult.Ok(views.html.commercialExpired()))
          case _ =>
            log.logger.info(customFieldMarker, s"Got a 410 while calling content api: $message, path: ${request.path}")
            NoCache(Gone)
        }

      // Custom DCR exceptions to distinguish from CAPI/other backend errors.
      case error: DCRLocalConnectException =>
        throw error
      case timeout: DCRTimeoutException =>
        log.logger.error(
          customFieldMarker,
          s"Got a timeout while calling DCR: ${timeout.getMessage}, path: ${request.path}",
          timeout,
        )
        NoCache(GatewayTimeout(timeout.getMessage))

      case timeout: TimeoutException =>
        log.logger.error(
          customFieldMarker,
          s"Got a timeout while calling content api: ${timeout.getMessage}, path: ${request.path}",
          timeout,
        )
        NoCache(GatewayTimeout(timeout.getMessage))

      case error =>
        log.logger.error(customFieldMarker, s"Content api exception: ${error.getMessage}", error)
        Option(error.getCause).foreach { cause =>
          log.logger.error(customFieldMarker, s"Content api exception cause (path: ${request.path}: ", cause)
        }
        NoCache(InternalServerError)
    }
  }

  /*
    NOTE: The htmlResponse & jsonResponse are () => Html functions so that you do not do all the rendering twice.
          Only the one you actually render is used
   */

  def renderFormat(htmlResponse: () => Html, jsonResponse: () => Html, page: model.Page)(implicit
      request: RequestHeader,
  ): Result =
    Cached(page) {
      if (request.isJson)
        JsonComponent(jsonResponse())
      else if (request.isEmail)
        RevalidatableResult.Ok(if (InlineEmailStyles.isSwitchedOn) InlineStyles(htmlResponse()) else htmlResponse())
      else
        RevalidatableResult.Ok(htmlResponse())
    }

  def renderFormat(htmlResponse: () => Html, jsonResponse: () => Html, page: model.Page, switches: Seq[Switch])(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): Result =
    Cached(page) {
      if (request.isJson)
        JsonComponent(page, jsonResponse())
      else if (request.isEmail)
        RevalidatableResult.Ok(if (InlineEmailStyles.isSwitchedOn) InlineStyles(htmlResponse()) else htmlResponse())
      else
        RevalidatableResult.Ok(htmlResponse())
    }

  def renderFormat(htmlResponse: () => Html, jsonResponse: () => Html, cacheTime: Integer)(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): Result =
    Cached(cacheTime) {
      if (request.isJson)
        JsonComponent(jsonResponse())
      else if (request.isEmail)
        RevalidatableResult.Ok(if (InlineEmailStyles.isSwitchedOn) InlineStyles(htmlResponse()) else htmlResponse())
      else
        RevalidatableResult.Ok(htmlResponse())
    }

  def renderFormat(html: () => Html, cacheTime: Integer)(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): Result = {
    renderFormat(html, html, cacheTime)
  }

  def renderFormat(htmlResponse: () => Html, jsonResponse: () => List[(String, Any)], page: model.Page)(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): Result =
    Cached(page) {
      if (request.isJson)
        JsonComponent(page, jsonResponse(): _*)
      else if (request.isEmail)
        RevalidatableResult.Ok(if (InlineEmailStyles.isSwitchedOn) InlineStyles(htmlResponse()) else htmlResponse())
      else
        RevalidatableResult.Ok(htmlResponse())
    }

  def renderHtml(html: Html, page: model.Page)(implicit request: RequestHeader, context: ApplicationContext): Result = {
    Cached(page)(RevalidatableResult.Ok(html))
      .withPreload(
        Preload.config(request).getOrElse(context.applicationIdentity, Seq.empty),
      )(context, request)
      .withPreconnect(HttpPreconnections.defaultUrls)
  }

  def renderJson(json: List[(String, Any)], page: model.Page)(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): Result =
    Cached(page) {
      JsonComponent(page, json: _*)
    }

  def renderJson(json: Html, page: model.Page)(implicit request: RequestHeader, context: ApplicationContext): Result =
    Cached(page) {
      JsonComponent(page, json)
    }

  def renderJson(json: JsValue, page: model.Page)(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): Result =
    Cached(page) {
      RevalidatableResult.Ok(json)
    }

  def renderEmail(html: Html, page: model.Page)(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): Result = {
    val htmlWithInlineStyles = if (InlineEmailStyles.isSwitchedOn) InlineStyles(html) else html
    if (request.isEmailJson) {
      val htmlWithUtmLinks = BrazeEmailFormatter(htmlWithInlineStyles)
      Cached(RecentlyUpdated)(RevalidatableResult.Ok(JsObject(Map("body" -> JsString(htmlWithUtmLinks.toString)))))
    } else if (request.isEmailTxt) {
      val htmlWithUtmLinks = BrazeEmailFormatter(htmlWithInlineStyles)
      Cached(RecentlyUpdated)(
        RevalidatableResult.Ok(JsObject(Map("body" -> JsString(HtmlTextExtractor(htmlWithUtmLinks))))),
      )
    } else {
      Cached(page)(RevalidatableResult.Ok(htmlWithInlineStyles))
    }
  }

}
