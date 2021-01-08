package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import common.{Edition, ImplicitControllerExecutionContext, JsonComponent, GuLogging}
import contentapi.ContentApiClient
import implicits.Requests
import model.{ApplicationContext, Cached, NoCache}
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
    log.info(s"Fetching article: $path for edition: ${edition.id}:")

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
