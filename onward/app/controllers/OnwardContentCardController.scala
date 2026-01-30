package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import common.{Edition, GuLogging, ImplicitControllerExecutionContext, JsonComponent}
import contentapi.ContentApiClient
import implicits.Requests
import model.{ApplicationContext, Cached, NoCache}
import net.logstash.logback.marker.Markers.append
import play.api.mvc._
import play.twirl.api.HtmlFormat

import scala.concurrent.Future

abstract class OnwardContentCardController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with Paging
    with GuLogging
    with ImplicitControllerExecutionContext
    with Requests {

  def render(path: String): Action[AnyContent]

  def renderHtml(path: String): Action[AnyContent] = render(path)

  protected def lookup(path: String, fields: String)(implicit request: RequestHeader): Future[ItemResponse] = {
    val edition = Edition(request)

    val requestId = request.headers.get("x-request-id").getOrElse("request-id-not-provided")
    val customFieldMarker = append("requestId", requestId)

    log.logger.info(customFieldMarker, s"Fetching article: $path for edition: ${edition.id}:")

    contentApiClient.getResponse(
      contentApiClient
        .item(path, edition)
        .showFields(fields)
        .showTags("all")
        .showElements("all"),
    )
  }

  protected def renderContent(html: HtmlFormat.Appendable, wrapInJson: HtmlFormat.Appendable)(implicit
      request: RequestHeader,
  ): Result = {
    if (!request.isJson) NoCache(Ok(html))
    else
      Cached(900) {
        JsonComponent(wrapInJson)
      }
  }

}
