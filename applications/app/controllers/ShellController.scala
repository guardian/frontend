package controllers

import common._
import conf.Configuration
import implicits.{HtmlFormat, JsonFormat}
import model.{ApplicationContext, MetaData, SectionId, StandalonePage}
import model.dotcomrendering.{DotcomRenderingConfig, DotcomRenderingShellDataModel, PageFooter, PageType}
import navigation.{FooterLinks, Nav}
import play.api.libs.json.JsObject
import play.api.libs.ws.WSClient
import play.api.mvc._

import scala.concurrent.Future

private class SitePage extends StandalonePage {
  val metadata: MetaData = MetaData.make(
    id = "page/shell",
    section = Some(SectionId.fromId("shell")),
    webTitle = "DCAR Shell",
  )
}

class ShellController(
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
    remoteRenderer: renderers.DotcomRenderingService,
)(implicit val context: ApplicationContext)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  def render(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      val edition = Edition(request)
      val page = new SitePage()
      val nav = Nav(page, edition)
      val combinedConfig: JsObject = DotcomRenderingConfig(
        page = page,
        request = request,
        isPreview = PageType(page, request, context).isPreview,
      )
      val dcrDataModel = DotcomRenderingShellDataModel(
        canonicalUrl = s"${Configuration.site.host}/$path",
        config = combinedConfig,
        contributionsServiceUrl = Configuration.contributionsService.url,
        editionId = edition.id,
        guardianBaseURL = Configuration.site.host,
        isAdFreeUser = views.support.Commercial.isAdFree(request),
        nav = nav,
        pageFooter = PageFooter(FooterLinks.getFooterByEdition(edition)),
        pageId = page.metadata.id,
      )
      val json = dcrDataModel.toJson
      request.getRequestFormat match {
        case HtmlFormat => remoteRenderer.getShell(wsClient, path, json)
        case JsonFormat => Future.successful(Ok(json))
        case _          => Future.successful(NotFound)
      }
    }
  }
}
