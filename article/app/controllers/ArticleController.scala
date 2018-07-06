package controllers

import com.gu.contentapi.client.model.v1.{ItemResponse, Content => ApiContent}
import common._
import contentapi.ContentApiClient
import model.{PageWithStoryPackage, _}
import pages.{ArticleEmailHtmlPage, ArticleHtmlPage}
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import play.api.mvc._
import views.support._
import metrics.TimingMetric
import renderers.RemoteRender
import services.LookerUpper

import scala.concurrent.Future

case class ArticlePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

class ArticleController(contentApiClient: ContentApiClient, val controllerComponents: ControllerComponents, ws: WSClient)(implicit context: ApplicationContext) extends BaseController with RendersItemResponse with Logging with ImplicitControllerExecutionContext {

  val lookerUpper: LookerUpper = new LookerUpper(contentApiClient)
  val remoteRender: RemoteRender = new RemoteRender()

  private def isSupported(c: ApiContent) = c.isArticle || c.isLiveBlog || c.isSudoku
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = mapModel(path, Some(Canonical))(render(path, _))

  def renderJson(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      mapModel(path, if (request.isGuuiJson) Some(ArticleBlocks) else None) {
        render(path, _)
      }
    }
  }

  def renderArticle(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      if(request.isGuui){
          mapModel(path, Some(ArticleBlocks)){
             remoteRender.render(ws, path, _)
          }
      } else {
          mapModel(path, Some(ArticleBlocks)) {
            render(path, _)
          }
      }
    }
  }

  def renderEmail(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      mapModel(path, range = Some(ArticleBlocks)) {
        render(path, _)
      }
    }
  }

  private def render(path: String, page: PageWithStoryPackage)(implicit request: RequestHeader): Future[Result] = page match {
    case article: ArticlePage =>
      val htmlResponse = () => {
        if (request.isEmail) ArticleEmailHtmlPage.html(article)
        else if (request.isAmp) views.html.articleAMP(article)
        else ArticleHtmlPage.html(article)
      }
      // add extra data for *.json?guui endpoint
      val contentFieldsJson = if (request.isGuuiJson) List("contentFields" -> Json.toJson(ContentFields(article.article))) else List()
      val jsonResponse = () => List(("html", views.html.fragments.articleBody(article))) ++ contentFieldsJson
      Future { renderFormat(htmlResponse, jsonResponse, article) }
  }

  def mapModel(path: String, range: Option[BlockRange] = None)(render: PageWithStoryPackage => Future[Result])(implicit request: RequestHeader): Future[Result] = {
    lookerUpper.lookup(path, range).map((itemResp: ItemResponse) => responseToModelOrResult(range)(itemResp)).recover(convertApiExceptions).flatMap {
      case Left(model) => render(model)
      case Right(other) => Future.successful(RenderOtherStatus(other))
    }
  }

  def responseToModelOrResult(range: Option[BlockRange])(response: ItemResponse)(implicit request: RequestHeader): Either[PageWithStoryPackage, Result] = {

    val supportedContent = response.content.filter(isSupported).map(Content(_))
    val supportedContentResult = ModelOrResult(supportedContent, response)
    val content: Either[PageWithStoryPackage, Result] = supportedContentResult.left.flatMap {
      case article: Article =>
        Left(ArticlePage(article, StoryPackages(article, response)))
      case _ => Right(NotFound)

    }

    content

  }

}
