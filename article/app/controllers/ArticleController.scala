package controllers

import com.gu.contentapi.client.model.v1.{Blocks, ItemResponse, Content => ApiContent}
import common._
import contentapi.ContentApiClient
import implicits._
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import model.dotcomrendering.{DotcomRenderingDataModel, PageType}
import model.meta.BlocksOn
import pages.{ArticleEmailHtmlPage, ArticleHtmlPage}
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.DotcomRenderingService
import services.dotcomrendering.{ArticlePicker, PressedArticle, RemoteRender}
import services.{CAPILookup, NewsletterService}
import views.support.RenderOtherStatus

import scala.concurrent.Future

class ArticleController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    ws: WSClient,
    remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService(),
    newsletterService: NewsletterService,
)(implicit context: ApplicationContext)
    extends BaseController
    with RendersItemResponse
    with GuLogging
    with ImplicitControllerExecutionContext {

  val capiLookup: CAPILookup = new CAPILookup(contentApiClient)

  private def isSupported(c: ApiContent) = c.isArticle || c.isLiveBlog || c.isSudoku || c.isHosted
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
  override def renderItem(path: String)(implicit req: RequestHeader): Future[Result] =
    mapAndRender(path, GenericFallback)()

  def mapAndRender(path: String, range: BlockRange)(
      modifier: BlocksOn[ArticlePage] => BlocksOn[ArticlePage] = identity,
  )(implicit req: RequestHeader): Future[Result] =
    mapModel(path, range) { pageBlocks => render(path, modifier(pageBlocks)) }

  def renderArticle(path: String): Action[AnyContent] = Action.async(mapAndRender(path, ArticleBlocks)()(_))
  def renderJson(path: String): Action[AnyContent] = renderArticle(path)
  def renderEmail(path: String): Action[AnyContent] = renderArticle(path)
  def renderHosted(campaignName: String, pageName: String): Action[AnyContent] = renderArticle(
    s"advertiser-content/$campaignName/$pageName",
  )

  def renderHeadline(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      def responseFromOptionalString(headline: Option[String]) = {
        headline
          .map(s => Cached(CacheTime.Default)(RevalidatableResult.Ok(s)))
          .getOrElse {
            logWarnWithRequestId(s"headline not found for $path")
            Cached(10)(WithoutRevalidationResult(NotFound))
          }
      }

      capiLookup
        .lookup(path, Some(ArticleBlocks))
        .map(_.content.map(_.webTitle))
        .map(responseFromOptionalString)
    }

  private def getJson(article: ArticlePage)(implicit request: RequestHeader): List[(String, Object)] = {
    val contentFieldsJson =
      if (request.forceDCR)
        List(
          "contentFields" -> Json.toJson(ContentFields(article.article)),
          "tags" -> Json.toJson(article.article.tags),
        )
      else List()
    List(("html", views.html.fragments.articleBody(article))) ++ contentFieldsJson
  }

  /** Returns a JSON representation of the payload that's sent to DCR when rendering the Article.
    */
  private def getDCRJson(pageBlocks: BlocksOn[ArticlePage])(implicit request: RequestHeader): JsValue = {
    val pageType: PageType = PageType(pageBlocks.page, request, context)
    val newsletter = newsletterService.getNewsletterForArticle(pageBlocks.page)

    DotcomRenderingDataModel.toJson(
      DotcomRenderingDataModel.forArticle(pageBlocks, request, pageType, newsletter),
    )
  }

  private def render(path: String, pageBlocks: BlocksOn[ArticlePage])(implicit
      request: RequestHeader,
  ): Future[Result] = {
    val article = pageBlocks.page
    val newsletter = newsletterService.getNewsletterForArticle(article)

    val tier = ArticlePicker.getTier(article, path)
    val isAmpSupported = article.article.content.shouldAmplify
    val pageType: PageType = PageType(article, request, context)
    request.getRequestFormat match {
      case JsonFormat if request.forceDCR =>
        Future.successful(common.renderJson(getDCRJson(pageBlocks), article).as("application/json"))
      case JsonFormat =>
        Future.successful(common.renderJson(getJson(article), article))
      case EmailFormat =>
        Future.successful(common.renderEmail(ArticleEmailHtmlPage.html(article), article))
      case HtmlFormat | AmpFormat if tier == PressedArticle =>
        servePressedPage(path)
      case AmpFormat if isAmpSupported =>
        remoteRenderer.getAMPArticle(ws, pageBlocks, pageType, newsletter)
      case HtmlFormat | AmpFormat if tier == RemoteRender =>
        remoteRenderer.getArticle(
          ws,
          pageBlocks,
          pageType,
          newsletter,
        )
      case HtmlFormat | AmpFormat =>
        Future.successful(common.renderHtml(ArticleHtmlPage.html(article), article))
      case AppsFormat =>
        remoteRenderer.getAppsArticle(
          ws,
          pageBlocks,
          pageType,
          newsletter,
        )
    }
  }

  private def mapModel(path: String, range: BlockRange)(
      render: BlocksOn[ArticlePage] => Future[Result],
  )(implicit request: RequestHeader): Future[Result] = {
    capiLookup
      .lookup(path, Some(range))
      .map(responseToModelOrResult)
      .recover(convertApiExceptions)
      .flatMap {
        case Right(pageBlocks) => render(pageBlocks)
        case Left(other)       => Future.successful(RenderOtherStatus(other))
      }
  }

  private def responseToModelOrResult(
      response: ItemResponse,
  )(implicit request: RequestHeader): Either[Result, BlocksOn[ArticlePage]] = {
    val supportedContent: Option[ContentType] = response.content.filter(isSupported).map(Content(_))
    val blocks = response.content.flatMap(_.blocks).getOrElse(Blocks())

    ModelOrResult(supportedContent, response) match {
      case Right(article: Article) =>
        Right(BlocksOn(ArticlePage(article, StoryPackages(article.metadata.id, response)), blocks))
      case Left(r) => Left(r)
      case _       => Left(NotFound)
    }
  }

  def servePressedPage(path: String)(implicit request: RequestHeader): Future[Result] = {
    val cacheable = WithoutRevalidationResult(
      Ok.withHeaders("X-Accel-Redirect" -> s"/s3-archive/www.theguardian.com/$path"),
    )
    Future.successful(Cached(CacheTime.ArchiveRedirect)(cacheable))
  }

}
