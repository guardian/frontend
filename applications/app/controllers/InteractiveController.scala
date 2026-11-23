package controllers

import ab.ABTests
import com.gu.contentapi.client.model.v1.{Blocks, ItemResponse}
import common._
import conf.Configuration
import conf.Configuration.interactive.cdnPath
import conf.switches.Switches
import conf.switches.Switches.{EditorialABTests, EditorialArticleABTests}
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
import services.{ArticleAbTestAgent, CAPIChannel, CAPILookup, SubnavAgent, USElection2020AmpPages}

import scala.concurrent.Future
import scala.concurrent.duration._

class InteractiveController(
    contentApiClient: ContentApiClient,
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
    remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService(),
    subnavAgent: SubnavAgent,
    articleAbTestAgent: ArticleAbTestAgent,
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

  private def determineArticleABTestPath(path: String)(implicit request: RequestHeader): String = {
    val isArticleABTestingEnabled = EditorialABTests.isSwitchedOn && EditorialArticleABTests.isSwitchedOn
    val isWebUserInVariantBBucket =
      isArticleABTestingEnabled && !request.isApps && ABTests.isUserInTestGroup(
        "fronts-and-curation-editorial-test",
        "b",
      )
    if (isWebUserInVariantBBucket) articleAbTestAgent.variantFor(path).getOrElse(path) else path
  }

  private def lookupItemResponse(path: String, channelId: Option[CAPIChannel] = None)(implicit
      request: RequestHeader,
  ): Future[ItemResponse] = {
    capiLookup.lookup(path, range = Some(ArticleBlocks), channel = channelId)
  }

  def modelAndRenderHtml(response: ItemResponse)(
      modifier: BlocksOn[InteractivePage] => BlocksOn[InteractivePage] = identity,
  )(implicit req: RequestHeader): Future[Result] = {
    modelAndRender(response)(pageBlocks => {
      val modifiedBlocks = modifier(pageBlocks)
      req.getRequestFormat match {
        case AppsFormat => renderApps(modifiedBlocks)
        case _          => renderHtml(modifiedBlocks)
      }
    })
  }

  def modelAndRender(
      response: ItemResponse,
      skipCanonicalRedirect: Boolean = false,
  )(render: BlocksOn[InteractivePage] => Future[Result])(implicit req: RequestHeader): Future[Result] = {
    val content = response.content
    ModelOrResult(
      content.map(Interactive.make).map(i => InteractivePage(i, StoryPackages(i.metadata.id, response))),
      response,
      skipCanonicalRedirect = skipCanonicalRedirect,
    ).fold(Future.successful, page => render(BlocksOn(page, content.flatMap(_.blocks).getOrElse(Blocks()))))
  }

  private def maskPathIfVariant(path: String, originalRequestPath: String)(
      pageBlocks: BlocksOn[InteractivePage],
  ): BlocksOn[InteractivePage] = {
    if (path == originalRequestPath) pageBlocks
    else {
      val maskedUrl = s"/$originalRequestPath"
      val interactive = pageBlocks.page.interactive
      val maskedMetadata = interactive.content.metadata.copy(
        id = originalRequestPath,
        url = maskedUrl,
        webUrl = s"${Configuration.site.host}$maskedUrl",
        canonicalUrl = Some(s"${Configuration.site.host}$maskedUrl"),
      )
      val maskedInteractive = interactive.copy(content = interactive.content.copy(metadata = maskedMetadata))
      pageBlocks.copy(page = pageBlocks.page.copy(interactive = maskedInteractive))
    }
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
    val customSubnav = subnavAgent.getSubnavForContent(pageBlocks.page.interactive.content)
    remoteRenderer.getInteractive(wsClient, pageBlocks, pageType, customSubnav)
  }

  def renderJson(pageBlocks: BlocksOn[InteractivePage])(implicit request: RequestHeader): Future[Result] = {
    val customSubnav = subnavAgent.getSubnavForContent(pageBlocks.page.interactive.content)
    val data =
      DotcomRenderingDataModel.forInteractive(
        pageBlocks = pageBlocks,
        request = request,
        pageType = PageType.apply(pageBlocks.page, request, context),
        customSubnav = customSubnav,
      )
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

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = mapAndRender(path)()

  def mapAndRender(path: String)(
      modifier: BlocksOn[InteractivePage] => BlocksOn[InteractivePage] = identity,
  )(implicit request: RequestHeader): Future[Result] = {
    val requestFormat = request.getRequestFormat
    val isUSElectionAMP = USElection2020AmpPages.pathIsSpecialHanding(path) && requestFormat == AmpFormat
    val pathToRender = determineArticleABTestPath(path)
    val isVariantArticle = path != pathToRender
    val channelId = if (isVariantArticle) Some(CAPIChannel.Variant) else None

    def render(pageBlocks: BlocksOn[InteractivePage]): Future[Result] = {
      val page = pageBlocks.page
      val tier = InteractivePicker.getRenderingTier(pathToRender)
      (requestFormat, tier) match {
        case (AppsFormat, DotcomRendering)                                          => renderApps(pageBlocks)
        case (AmpFormat, DotcomRendering) if page.interactive.content.shouldAmplify => renderAmp(pageBlocks)
        case (HtmlFormat | AmpFormat, DotcomRendering)                              => renderHtml(pageBlocks)
        case (JsonFormat, DotcomRendering)                                          => renderJson(pageBlocks)
        case (HtmlFormat, PressedInteractive)                                       => servePressedPage(pathToRender)
        case _                                                                      => renderNonDCR(page)
      }
    }

    if (isUSElectionAMP) {
      renderUSElectionAMPPage(path)
    } else {
      val res = for {
        resp <- lookupItemResponse(pathToRender, channelId)
        result <- modelAndRender(resp, skipCanonicalRedirect = isVariantArticle) { pageBlocks =>
          render(modifier(maskPathIfVariant(pathToRender, path)(pageBlocks)))
        }
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
