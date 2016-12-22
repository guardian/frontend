package controllers

import common.{Edition, ExecutionContexts, JsonComponent, Logging}
import contentapi.ContentApiClient
import implicits.Requests
import model.{ApplicationContext, Cached, NoCache}
import play.api.mvc._
import play.twirl.api.HtmlFormat

abstract class RenderTemplateController(contentApiClient: ContentApiClient)(implicit context: ApplicationContext) extends Controller with Paging with Logging with ExecutionContexts with Requests {

  def render(path: String): Action[AnyContent]

  def renderHtml(path: String) = render(path)

  protected def lookup(path: String, fields: String)(implicit request: RequestHeader) = {
    val edition = Edition(request)
    log.info(s"Fetching article: $path for edition: ${edition.id}:")

    contentApiClient.getResponse(
      contentApiClient.item(path, edition)
        .showFields(fields)
        .showTags("all")
        .showElements("all")
    )
  }

  protected def renderContent(html: HtmlFormat.Appendable, wrapInJson: HtmlFormat.Appendable)(implicit request: RequestHeader) = {
    if (!request.isJson) NoCache(Ok(html))
    else Cached(900) {
      JsonComponent(wrapInJson)
    }
  }


}
