package controllers

import com.gu.contentapi.client.model.v1.{ItemResponse, Content => ApiContent}
import common._
import contentapi.ContentApiClient
import model.{ContentType, PageWithStoryPackage, _}
import pages.{ArticleEmailHtmlPage, ArticleHtmlPage}
import play.api.libs.ws.WSClient
import play.api.mvc._
import views.support._
import metrics.TimingMetric
import play.api.libs.json.Json
import renderers.RemoteRender
import services.{CAPILookup, RemoteRender, RenderingTierPicker}
import implicits.{AmpFormat, EmailFormat, HtmlFormat, JsonFormat}

import scala.concurrent.Future

case class ArticlePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

class ArticleController(contentApiClient: ContentApiClient, val controllerComponents: ControllerComponents, ws: WSClient)(implicit context: ApplicationContext) extends BaseController with RendersItemResponse with Logging with ImplicitControllerExecutionContext {

  val capiLookup: CAPILookup = new CAPILookup(contentApiClient)
  val remoteRender: RemoteRender = new RemoteRender()

  private def isSupported(c: ApiContent) = c.isArticle || c.isLiveBlog || c.isSudoku
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = mapModel(path, Canonical)(render(path, _))

  def renderJson(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      mapModel(path, ArticleBlocks) {
        render(path, _)
      }
    }
  }

  def renderArticle(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
        mapModel(path, ArticleBlocks) {
          if(request.isGuui) remoteRender.render(ws, path, _) else render(path, _)
        }
    }
  }

  def renderEmail(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      mapModel(path, ArticleBlocks) {
        render(path, _)
      }
    }
  }

  private def getJson(article: ArticlePage)(implicit request: RequestHeader) = {
    val contentFieldsJson = if (request.isGuuiJson) List("contentFields" -> Json.toJson(ContentFields(article.article))) else List()
    List(("html", views.html.fragments.articleBody(article))) ++ contentFieldsJson
  }

  private def render(path: String, article: ArticlePage)(implicit request: RequestHeader): Future[Result] = {

    val renderTier = RenderingTierPicker.getRenderTierFor(article)

    renderTier match {
      case RemoteRender => log.logger.info(s"Remotely renderable article $path");
      case _ =>
    }

    Future {
      request.getRequestFormat match {
        case JsonFormat => common.renderJson(getJson(article), article)
        case EmailFormat => common.renderEmail(ArticleEmailHtmlPage.html(article), article)
        case HtmlFormat => common.renderHtml(ArticleHtmlPage.html(article), article)
        case AmpFormat => common.renderHtml(views.html.articleAMP(article), article)
      }
    }

  }

  private def mapModel(path: String, range: BlockRange)(render: ArticlePage => Future[Result])(implicit request: RequestHeader): Future[Result] = {
    capiLookup
      .lookup(path, Some(range))
      .map(responseToModelOrResult)
      .recover(convertApiExceptions)
      .flatMap {
        case Left(model) => render(model)
        case Right(other) => Future.successful(RenderOtherStatus(other))
      }
  }

  private def responseToModelOrResult(response: ItemResponse)(implicit request: RequestHeader): Either[ArticlePage, Result] = {
    val supportedContent: Option[ContentType] = response.content.filter(isSupported).map(Content(_))

    ModelOrResult(supportedContent, response) match {
      case Left(article:Article) => Left(ArticlePage(article, StoryPackages(article, response)))
      case Right(r) => Right(r)
      case _ => Right(NotFound)
    }

  }

}
