package controllers

import java.lang.System.currentTimeMillis

import com.gu.contentapi.client.model.v1.{ItemResponse, Content => ApiContent}
import common._
import conf.switches.Switches
import contentapi.ContentApiClient
import model.LiveBlogHelpers._
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

class ArticleController(contentApiClient: ContentApiClient, val controllerComponents: ControllerComponents, ws: WSClient)(implicit context: ApplicationContext) extends BaseController
    with RendersItemResponse with Logging with ImplicitControllerExecutionContext {

  private def isSupported(c: ApiContent) = c.isArticle || c.isLiveBlog || c.isSudoku
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = mapModel(path, Some(Canonical))(render(path, _))

  private def noAMP(renderPage: => Result)(implicit  request: RequestHeader): Result = {
    if (request.isAmp) NotFound
    else renderPage
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

      val contentFieldsJson = if (request.isGuuiJson) List("contentFields" -> Json.toJson(ContentFields(article.article))) else List()

      val jsonResponse = () => List(("html", views.html.fragments.articleBody(article))) ++ contentFieldsJson
      renderFormat(htmlResponse, jsonResponse, article)
  }

  def renderJson(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      mapModel(path, if (request.isGuuiJson) Some(ArticleBlocks) else None) {
        render(path, _)
      }
    }
  }

  def timedFuture[T](future: Future[T], metric: TimingMetric): Future[T] = {
      val start = currentTimeMillis
      future.onComplete(_ => metric.recordDuration(currentTimeMillis - start))
      future
  }

  def renderArticle(path: String): Action[AnyContent] = {

    Action.async { implicit request =>

      timedFuture(
        mapModel(path, range = if (request.isEmail) Some(ArticleBlocks) else None) {
          render(path, _)
        },
        ArticleRenderingMetrics.LocalRenderingMetric
      )

    }
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
        // Enable an email format for 'Minute' content (which are actually composed as a LiveBlog), without changing the non-email display of the page
      case liveBlog: Article if liveBlog.isLiveBlog && request.isEmail =>
        Left(MinutePage(liveBlog, StoryPackages(liveBlog, response)))
      case liveBlog: Article if liveBlog.isLiveBlog =>
        range.map {
          createLiveBlogModel(liveBlog, response, _)
        }.getOrElse(Right(NotFound))
      case article: Article =>
        Left(ArticlePage(article, StoryPackages(article, response)))
    }

    content

  }


}


