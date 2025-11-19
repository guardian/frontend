package controllers

import com.gu.contentapi.client.model.v1.{Blocks, ItemResponse, Content => ApiContent}
import common._
import contentapi.ContentApiClient
import implicits.{AmpFormat, AppsFormat, EmailFormat, HtmlFormat, JsonFormat}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.dotcomrendering.{DotcomRenderingDataModel, PageType}
import model._
import pages.{ArticleEmailHtmlPage, ArticleHtmlPage}
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.DotcomRenderingService
import services.{CAPILookup, NewsletterService}
import services.dotcomrendering.{ArticlePicker, PressedArticle, RemoteRender}

import scala.concurrent.Future

class ArticleController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    ws: WSClient,
    remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService(),
    newsletterService: NewsletterService,
)(implicit val context: ApplicationContext)
    extends ArticleControllerCommon
    with RendersItemResponse {

  val capiLookup: CAPILookup = new CAPILookup(contentApiClient)

  override protected def isSupported(c: ApiContent) = c.isArticle || c.isLiveBlog || c.isSudoku
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] =
    mapModel(path, GenericFallback)((article, blocks) => render(path, article, blocks))

  def renderJson(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      mapModel(path, ArticleBlocks) { (article, blocks) =>
        render(path, article, blocks)
      }
    }
  }

  def renderArticle(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      mapModel(path, ArticleBlocks) { (article, blocks) =>
        render(path, article, blocks)
      }
    }
  }

  def renderEmail(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      mapModel(path, ArticleBlocks) { (article, blocks) =>
        render(path, article, blocks)
      }
    }
  }

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
  private def getDCRJson(article: ArticlePage, blocks: Blocks)(implicit request: RequestHeader): JsValue = {
    val pageType: PageType = PageType(article, request, context)
    val newsletter = newsletterService.getNewsletterForArticle(article)

    DotcomRenderingDataModel.toJson(
      DotcomRenderingDataModel
        .forArticle(article, blocks, request, pageType, newsletter),
    )
  }

  private def render(path: String, article: ArticlePage, blocks: Blocks)(implicit
      request: RequestHeader,
  ): Future[Result] = {

    val newsletter = newsletterService.getNewsletterForArticle(article)

    val tier = ArticlePicker.getTier(article, path)
    val isAmpSupported = article.article.content.shouldAmplify
    val pageType: PageType = PageType(article, request, context)
    request.getRequestFormat match {
      case JsonFormat if request.forceDCR =>
        Future.successful(common.renderJson(getDCRJson(article, blocks), article).as("application/json"))
      case JsonFormat =>
        Future.successful(common.renderJson(getJson(article), article))
      case EmailFormat =>
        Future.successful(common.renderEmail(ArticleEmailHtmlPage.html(article), article))
      case HtmlFormat | AmpFormat if tier == PressedArticle =>
        servePressedPage(path)
      case AmpFormat if isAmpSupported =>
        remoteRenderer.getAMPArticle(ws, article, blocks, pageType, newsletter)
      case HtmlFormat | AmpFormat if tier == RemoteRender =>
        remoteRenderer.getArticle(
          ws,
          article,
          blocks,
          pageType,
          newsletter,
        )
      case HtmlFormat | AmpFormat =>
        Future.successful(common.renderHtml(ArticleHtmlPage.html(article), article))
      case AppsFormat =>
        remoteRenderer.getAppsArticle(
          ws,
          article,
          blocks,
          pageType,
          newsletter,
        )
    }
  }

  def servePressedPage(path: String)(implicit request: RequestHeader): Future[Result] = {
    val cacheable = WithoutRevalidationResult(
      Ok.withHeaders("X-Accel-Redirect" -> s"/s3-archive/www.theguardian.com/$path"),
    )
    Future.successful(Cached(CacheTime.ArchiveRedirect)(cacheable))
  }

}
