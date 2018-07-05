package controllers

import com.gu.contentapi.client.model.v1.{ItemResponse, Content => ApiContent}
import common._
import conf.switches.Switches
import contentapi.ContentApiClient
import model.{PageWithStoryPackage, _}
import pages.{ArticleEmailHtmlPage, ArticleHtmlPage, MinuteHtmlPage}
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import play.api.mvc._
import views.support._
import metrics.TimingMetric

import scala.concurrent.Future

case class ArticlePage(article: Article, related: RelatedContent) extends PageWithStoryPackage
case class MinutePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

class ArticleController(contentApiClient: ContentApiClient, val controllerComponents: ControllerComponents, ws: WSClient)(implicit context: ApplicationContext) extends BaseController with RendersItemResponse with Logging with ImplicitControllerExecutionContext {

  private def isSupported(c: ApiContent) = c.isArticle || c.isLiveBlog || c.isSudoku
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = mapModel(path, Some(Canonical))(render(path, _))

  private def noAMP(renderPage: => Result)(implicit  request: RequestHeader): Result = {
    if (request.isAmp) NotFound
    else renderPage
  }

  def renderJson(path: String): Action[AnyContent] = {
    println("Rendering article json")
    Action.async { implicit request =>
      mapModel(path, if (request.isGuuiJson) Some(ArticleBlocks) else None) {
        render(path, _)
      }
    }
  }

  def renderArticle(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      println("Rendering article")
      mapModel(path, range = Some(ArticleBlocks)) {
        render(path, _)
      }
    }
  }

  def renderEmail(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      println("Rendering email")
      mapModel(path, range = Some(ArticleBlocks)) {
        render(path, _)
      }
    }
  }

  private def render(path: String, page: PageWithStoryPackage)(implicit request: RequestHeader) = page match {
    case minute: MinutePage =>
      noAMP {
        val htmlResponse = () => {
          if (request.isEmail) ArticleEmailHtmlPage.html(minute)
          else MinuteHtmlPage.html(minute)
        }

        val jsonResponse = () => views.html.fragments.minuteBody(minute)
        renderFormat(htmlResponse, jsonResponse, minute, Switches.all)
      }

    case article: ArticlePage =>

      val htmlResponse = () => {
        if (request.isEmail) ArticleEmailHtmlPage.html(article)
        else if (request.isAmp) views.html.articleAMP(article)
        else ArticleHtmlPage.html(article)
      }

      // add extra data for *.json?guui endpoint
      val contentFieldsJson = if (request.isGuuiJson) List("contentFields" -> Json.toJson(ContentFields(article.article))) else List()

      val jsonResponse = () => List(("html", views.html.fragments.articleBody(article))) ++ contentFieldsJson
      renderFormat(htmlResponse, jsonResponse, article)
  }

  // range: None means the url didn't include /live/, Some(...) means it did.  Canonical just means no url parameter
  // if we switch to using blocks instead of body for articles, then it no longer needs to be Optional
  def mapModel(path: String, range: Option[BlockRange] = None)(render: PageWithStoryPackage => Result)(implicit request: RequestHeader): Future[Result] = {
    lookup(path, range) map responseToModelOrResult(range) recover convertApiExceptions map {
      case Left(model) => render(model)
      case Right(other) => RenderOtherStatus(other)
    }
  }

  private def lookup(path: String, range: Option[BlockRange])(implicit request: RequestHeader): Future[ItemResponse] = {
    val edition = Edition(request)

    val capiItem = contentApiClient.item(path, edition)
      .showTags("all")
      .showFields("all")
      .showReferences("all")
      .showAtoms("all")

    val capiItemWithBlocks = range.map { blockRange =>
      val blocksParam = blockRange.query.map(_.mkString(",")).getOrElse("body")
      capiItem.showBlocks(blocksParam)
    }.getOrElse(capiItem)
    contentApiClient.getResponse(capiItemWithBlocks)

  }

  /**
   * convert a response into something we can render, and return it
   * optionally, throw a response if we know it's not right to send the content
    *
    * @param response
   * @return Either[PageWithStoryPackage, Result]
   */
  def responseToModelOrResult(range: Option[BlockRange])(response: ItemResponse)(implicit request: RequestHeader): Either[PageWithStoryPackage, Result] = {

    val supportedContent = response.content.filter(isSupported).map(Content(_))
    val supportedContentResult = ModelOrResult(supportedContent, response)
    val content: Either[PageWithStoryPackage, Result] = supportedContentResult.left.flatMap {
      case minute: Article if minute.isTheMinute =>
        Left(MinutePage(minute, StoryPackages(minute, response)))
      case article: Article =>
        Left(ArticlePage(article, StoryPackages(article, response)))
    }

    content

  }

}
