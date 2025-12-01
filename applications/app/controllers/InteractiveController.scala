package controllers

import com.gu.contentapi.client.model.v1.{Blocks, ItemResponse}
import common._
import conf.Configuration.interactive.cdnPath
import conf.switches.Switches
import contentapi.ContentApiClient
import implicits.{AmpFormat, AppsFormat, HtmlFormat, JsonFormat}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.content.InteractiveAtom
import model.dotcomrendering.{DotcomRenderingDataModel, PageType}
import model.meta.BlocksOn
import model._
import org.apache.commons.lang.StringEscapeUtils
import pages.InteractiveHtmlPage
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.DotcomRenderingService
import services.dotcomrendering.{DotcomRendering, InteractivePicker, PressedInteractive}
import services.{CAPILookup, USElection2020AmpPages}

import scala.concurrent.Future
import scala.concurrent.duration._

class InteractiveController(
    contentApiClient: ContentApiClient,
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
    remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService(),
)(implicit context: ApplicationContext)
    extends BaseController
    with RendersItemResponse
    with GuLogging
    with ImplicitControllerExecutionContext {

  val capiLookup: CAPILookup = new CAPILookup(contentApiClient)

  def renderInteractiveJson(path: String): Action[AnyContent] = renderInteractive(path)
  def renderInteractive(path: String): Action[AnyContent] = Action.async { implicit request => renderItem(path) }

  def proxyInteractiveWebWorker(path: String, file: String): Action[AnyContent] =
    Action.async { implicit request =>
      val timestamp = request.getQueryString("timestamp")
      val serviceWorkerPath = getWebWorkerPath(path, file, timestamp)

      wsClient.url(serviceWorkerPath).get().map { response =>
        Cached(365.days) {
          response.status match {
            case 200 =>
              val contentType = response.headers("Content-Type").mkString(",")
              RevalidatableResult(Ok(response.body).as(contentType), response.body)
            case otherStatus => WithoutRevalidationResult(new Status(otherStatus))
          }
        }
      }
    }

  def servePressedPage(path: String)(implicit request: RequestHeader): Future[Result] = {
    val cacheable = WithoutRevalidationResult(
      Ok.withHeaders("X-Accel-Redirect" -> s"/s3-archive/www.theguardian.com/$path"),
    )
    Future.successful(Cached(CacheTime.ArchiveRedirect)(cacheable))
  }

  private def getWebWorkerPath(path: String, file: String, timestamp: Option[String]): String = {
    val stage = if (context.isPreview) "preview" else "live"
    val deployPath = timestamp.map(ts => s"$path/$ts").getOrElse(path)

    s"$cdnPath/service-workers/$stage/$deployPath/$file"
  }

  private def lookupItemResponse(path: String)(implicit request: RequestHeader): Future[ItemResponse] = {
    capiLookup.lookup(path, range = Some(ArticleBlocks))
  }

  def modelAndRender(
      response: ItemResponse,
  )(render: BlocksOn[InteractivePage] => Future[Result])(implicit req: RequestHeader): Future[Result] = {
    val content = response.content
    ModelOrResult(
      content.map(Interactive.make).map(i => InteractivePage(i, StoryPackages(i.metadata.id, response))),
      response,
    ).fold(Future.successful, page => render(BlocksOn(page, content.flatMap(_.blocks).getOrElse(Blocks()))))
  }

  override def canRender(i: ItemResponse): Boolean = i.content.exists(_.isInteractive)

  def renderNonDCR(page: InteractivePage)(implicit request: RequestHeader): Future[Result] = {
    val htmlResponse = () => InteractiveHtmlPage.html(page)
    val jsonResponse = () => views.html.fragments.interactiveBody(page)
    val res = renderFormat(htmlResponse, jsonResponse, page, Switches.all)
    Future.successful(res)
  }

  def renderHtml(pageBlocks: BlocksOn[InteractivePage])(implicit request: RequestHeader): Future[Result] = {
    val pageType = PageType.apply(pageBlocks.page, request, context)
    remoteRenderer.getInteractive(wsClient, pageBlocks, pageType)
  }

  def renderJson(pageBlocks: BlocksOn[InteractivePage])(implicit request: RequestHeader): Future[Result] = {
    val data =
      DotcomRenderingDataModel.forInteractive(pageBlocks, request, PageType.apply(pageBlocks.page, request, context))
    val dataJson = DotcomRenderingDataModel.toJson(data)
    val res = common.renderJson(dataJson, pageBlocks.page).as("application/json")
    Future.successful(res)
  }

  def renderAmp(pageBlocks: BlocksOn[InteractivePage])(implicit request: RequestHeader): Future[Result] = {
    val pageType = PageType.apply(pageBlocks.page, request, context)
    remoteRenderer.getAMPInteractive(wsClient, pageBlocks, pageType)
  }

  def renderApps(pageBlocks: BlocksOn[InteractivePage])(implicit request: RequestHeader): Future[Result] = {
    val pageType = PageType.apply(pageBlocks.page, request, context)
    remoteRenderer.getAppsInteractive(wsClient, pageBlocks, pageType)
  }

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = {
    val requestFormat = request.getRequestFormat
    val isUSElectionAMP = USElection2020AmpPages.pathIsSpecialHanding(path) && requestFormat == AmpFormat

    def render(pageBlocks: BlocksOn[InteractivePage]): Future[Result] = {
      val page = pageBlocks.page
      val tier = InteractivePicker.getRenderingTier(path)
      (requestFormat, tier) match {
        case (AppsFormat, DotcomRendering)                                          => renderApps(pageBlocks)
        case (AmpFormat, DotcomRendering) if page.interactive.content.shouldAmplify => renderAmp(pageBlocks)
        case (HtmlFormat | AmpFormat, DotcomRendering)                              => renderHtml(pageBlocks)
        case (JsonFormat, DotcomRendering)                                          => renderJson(pageBlocks)
        case (HtmlFormat, PressedInteractive)                                       => servePressedPage(path)
        case _                                                                      => renderNonDCR(page)
      }
    }

    if (isUSElectionAMP) { // A special-cased AMP page for various US Election (2020) interactive pages.
      renderUSElectionAMPPage(path)
    } else {
      val res = for {
        resp <- lookupItemResponse(path)
        result <- modelAndRender(resp)(render)
      } yield result

      res.recover(convertApiExceptionsWithoutEither)
    }
  }

  def renderUSElectionAMPPage(path: String)(implicit request: RequestHeader): Future[Result] = {
    // We use the same AMP atom/page for various US election pages.
    val capiPath = USElection2020AmpPages.pathToAmpAtomId(path)
    val response = lookupItemResponse(capiPath)

    response.map { response =>
      response.interactive match {
        case Some(atom) => {
          val interactive = InteractiveAtom.make(atom)
          Ok(StringEscapeUtils.unescapeHtml(interactive.html)).as("text/html")
        }
        case None => Ok("error: 6a0a6be4-e702-4b51-8f26-01f9921c6b74")
      }
    }
  }
}
