package controllers

import com.gu.contentapi.client.model.v1.{Blocks, ItemResponse, Content => ApiContent}
import common._
import contentapi.ContentApiClient
import implicits.{AmpFormat, EmailFormat, HtmlFormat, JsonFormat}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.dotcomponents.DotcomponentsDataModel
import model.{ContentType, PageWithStoryPackage, _}
import pages.{ArticleEmailHtmlPage, ArticleHtmlPage}
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.RemoteRenderer
import services.CAPILookup
import services.dotcomponents._
import views.support._

import scala.concurrent.Future

case class ArticlePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

class ArticleController(contentApiClient: ContentApiClient, val controllerComponents: ControllerComponents, ws: WSClient, remoteRenderer: renderers.RemoteRenderer = RemoteRenderer(), renderingTierPicker: RenderingTierPicker = RenderingTierPicker())(implicit context: ApplicationContext) extends BaseController with RendersItemResponse with Logging with ImplicitControllerExecutionContext {

  val capiLookup: CAPILookup = new CAPILookup(contentApiClient)

  private def isSupported(c: ApiContent) = c.isArticle || c.isLiveBlog || c.isSudoku
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = mapModel(path, Canonical)((article, blocks) => render(path, article, blocks))

  def renderJson(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      mapModel(path, ArticleBlocks) {
        (article, blocks) => render(path, article, blocks)
      }
    }
  }

  def renderArticle(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      mapModel(path, ArticleBlocks)( (article, blocks) => {
        renderingTierPicker.getTier(article, blocks) match {
          case RemoteRender => remoteRenderer.getArticle(ws, path, article, blocks)
          case RemoteRenderAMP => remoteRenderer.getAMPArticle(ws, path, article, blocks)
          case LocalRender => render(path, article, blocks)
        }
      })
    }
  }

  def renderEmail(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      mapModel(path, ArticleBlocks) {
        (article, blocks) => render(path, article, blocks)
      }
    }
  }

  def renderHeadline(path: String): Action[AnyContent] = Action.async { implicit request =>
    def responseFromHeadline(headline: Option[String]) = {
      headline
        .map(title => Cached(CacheTime.Default)(RevalidatableResult.Ok(title)))
        .getOrElse {
          log.warn(s"headline not found for $path")
          Cached(10)(WithoutRevalidationResult(NotFound))
        }
    }

    capiLookup
      .lookup(path, Some(ArticleBlocks))
      .map(_.content.map(_.webTitle))
      .map(responseFromHeadline)
  }

  private def getJson(article: ArticlePage)(implicit request: RequestHeader) = {
    val contentFieldsJson = if (request.isGuuiJson) List(
      "contentFields" -> Json.toJson(ContentFields(article.article)),
      "tags" -> Json.toJson(article.article.tags)) else List()
    List(("html", views.html.fragments.articleBody(article))) ++ contentFieldsJson
  }

  private def getGuuiJson(article: ArticlePage, blocks: Blocks)(implicit request: RequestHeader): String =
    DotcomponentsDataModel.toJsonString(DotcomponentsDataModel.fromArticle(article, request, blocks))

  private def render(path: String, article: ArticlePage, blocks: Blocks)(implicit request: RequestHeader): Future[Result] = {
    Future {
      request.getRequestFormat match {
        case JsonFormat if request.isGuui => common.renderJson(getGuuiJson(article, blocks), article).as("application/json")
        case JsonFormat => common.renderJson(getJson(article), article)
        case EmailFormat => common.renderEmail(ArticleEmailHtmlPage.html(article), article)
        case HtmlFormat => common.renderHtml(ArticleHtmlPage.html(article), article)
        case AmpFormat => common.renderHtml(views.html.articleAMP(article), article)
      }
    }
  }

  private def mapModel(path: String, range: BlockRange)(render: (ArticlePage, Blocks) => Future[Result])(implicit request: RequestHeader): Future[Result] = {
    capiLookup
      .lookup(path, Some(range))
      .map(responseToModelOrResult)
      .recover(convertApiExceptions)
      .flatMap {
        case Left((model, blocks)) => render(model, blocks)
        case Right(other) => Future.successful(RenderOtherStatus(other))
      }
  }

  private def responseToModelOrResult(response: ItemResponse)(implicit request: RequestHeader): Either[(ArticlePage, Blocks), Result] = {
    val supportedContent: Option[ContentType] = response.content.filter(isSupported).map(Content(_))
    val blocks = response.content.flatMap(_.blocks).getOrElse(Blocks())

    ModelOrResult(supportedContent, response) match {
      case Left(article:Article) => Left((ArticlePage(article, StoryPackages(article.metadata.id, response)), blocks))
      case Right(r) => Right(r)
      case _ => Right(NotFound)
    }

  }

}
