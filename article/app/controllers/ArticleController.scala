package controllers

import _root_.liveblog.LiveBlogCurrentPage
import com.gu.contentapi.client.model.v1.{ItemResponse, Content => ApiContent}
import common._
import conf.switches.Switches
import contentapi.ContentApiClient
import model.Cached.WithoutRevalidationResult
import model._
import model.liveblog.{BodyBlock, KeyEventData}
import org.joda.time.DateTime
import org.scala_tools.time.Imports._
import play.api.libs.functional.syntax._
import play.api.libs.json.{Json, _}
import play.api.mvc._
import views.support._

import scala.concurrent.Future
import scala.util.parsing.combinator.RegexParsers

trait PageWithStoryPackage extends ContentPage {
  def article: Article
  def related: RelatedContent
  override lazy val item = article
}

case class ArticlePage(article: Article, related: RelatedContent) extends PageWithStoryPackage
case class LiveBlogPage(article: Article, currentPage: LiveBlogCurrentPage, related: RelatedContent) extends PageWithStoryPackage
case class MinutePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

object ArticleController extends Controller with RendersItemResponse with Logging with ExecutionContexts {

  private def isSupported(c: ApiContent) = c.isArticle || c.isLiveBlog || c.isSudoku
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = mapModel(path, blocks = true)(render(path, _))


  private def renderNewerUpdates(page: PageWithStoryPackage, lastUpdateBlockId: String, isLivePage: Option[Boolean])(implicit request: RequestHeader): Result = {
    val newBlocks = page.article.fields.blocks.takeWhile(block => s"block-${block.id}" != lastUpdateBlockId)
    val blocksHtml = views.html.liveblog.liveBlogBlocks(newBlocks, page.article, Edition(request).timezone)
    val timelineHtml = views.html.liveblog.keyEvents("", KeyEventData(newBlocks, Edition(request).timezone))
    val allPagesJson = Seq("timeline" -> timelineHtml, "numNewBlocks" -> newBlocks.size)
    val livePageJson = isLivePage.filter(_ == true).map { _ =>
      "html" -> blocksHtml
    }
    Cached(page)(JsonComponent((allPagesJson ++ livePageJson): _*))
  }

  case class TextBlock(
    id: String,
    title: Option[String],
    publishedDateTime: Option[DateTime],
    lastUpdatedDateTime: Option[DateTime],
    body: String
    )

  implicit val blockWrites = (
    (__ \ "id").write[String] ~
      (__ \ "title").write[Option[String]] ~
      (__ \ "publishedDateTime").write[Option[DateTime]] ~
      (__ \ "lastUpdatedDateTime").write[Option[DateTime]] ~
      (__ \ "body").write[String]
    )(unlift(TextBlock.unapply))

  private def blockText(page: PageWithStoryPackage, number: Int)(implicit request: RequestHeader): Result = page match {
    case LiveBlogPage(liveBlog, _, _) =>
      val blocks = liveBlog.blocks.collect {
        case BodyBlock(id, html, _, title, _, _, _, publishedAt, _, updatedAt, _, _) if html.trim.nonEmpty =>
          TextBlock(id, title, publishedAt, updatedAt, html)
      }.take(number)
      Cached(page)(JsonComponent("blocks" -> Json.toJson(blocks)))
    case _ => Cached(600)(WithoutRevalidationResult(NotFound("Can only return block text for a live blog")))

  }

  private def noAMP(renderPage: => Result)(implicit  request: RequestHeader): Result = {
    if (request.isAmp) NotFound
    else renderPage
  }

  private def render(path: String, page: PageWithStoryPackage)(implicit request: RequestHeader) = page match {
    case blog: LiveBlogPage =>
      noAMP {
        val htmlResponse = () => views.html.liveBlog (blog)
        val jsonResponse = () => views.html.liveblog.liveBlogBody (blog)
        renderFormat(htmlResponse, jsonResponse, blog, Switches.all)
      }

    case minute: MinutePage =>
      noAMP {
        val htmlResponse = () => {
          if (request.isEmail) views.html.articleEmail(minute)
          else                 views.html.minute(minute)
        }

        val jsonResponse = () => views.html.fragments.minuteBody(minute)
        renderFormat(htmlResponse, jsonResponse, minute, Switches.all)
      }

    case article: ArticlePage =>
      val htmlResponse = () => {
        if (request.isEmail) views.html.articleEmail(article)
        else if (article.article.isImmersive) views.html.articleImmersive(article)
        else if (request.isAmp) views.html.articleAMP(article)
        else views.html.article(article)
      }

      val jsonResponse = () => views.html.fragments.articleBody(article)
      renderFormat(htmlResponse, jsonResponse, article, Switches.all)
  }

  def renderLiveBlog(path: String, page: Option[String] = None) =
    Action.async { implicit request =>
      mapModel(path, blocks = true, page) {// temporarily only ask for blocks too for things we know are new live blogs until until the migration is done and we can always use blocks
        render(path, _)
      }
    }

  def renderLiveBlogJson(path: String, lastUpdate: Option[String], rendered: Option[Boolean], isLivePage: Option[Boolean]) = {
    Action.async { implicit request =>
      mapModel(path, blocks = true) { model =>
        (lastUpdate, rendered) match {
          case (Some(lastUpdate), _) => renderNewerUpdates(model, lastUpdate, isLivePage)
          case (None, Some(false)) => blockText(model, 6)
          case (_, _) => render(path, model)
        }
      }
    }
  }

  def renderJson(path: String) = {
    Action.async { implicit request =>
      mapModel(path) {
        render(path, _)
      }
    }
  }

  def renderArticle(path: String) = {
    Action.async { implicit request =>
      mapModel(path, blocks = request.isEmail) {
        render(path, _)
      }
    }
  }

  def mapModel(path: String, blocks: Boolean = false, pageParam: Option[String] = None)(render: PageWithStoryPackage => Result)(implicit request: RequestHeader): Future[Result] = {
    lookup(path, blocks) map responseToModelOrResult(pageParam) recover convertApiExceptions map {
      case Left(model) => render(model)
      case Right(other) => RenderOtherStatus(other)
    }
  }

  private def lookup(path: String, blocks: Boolean)(implicit request: RequestHeader): Future[ItemResponse] = {
    val edition = Edition(request)

    log.info(s"Fetching article: $path for edition ${edition.id}: ${RequestLog(request)}")
    val capiItem = ContentApiClient.item(path, edition)
      .showSection(true)
      .showTags("all")
      .showFields("all")
      .showReferences("all")
      .showAtoms("all")

    val capiItemWithBlocks = if (blocks) capiItem.showBlocks("body") else capiItem
    ContentApiClient.getResponse(capiItemWithBlocks)

  }

  /**
   * convert a response into something we can render, and return it
   * optionally, throw a response if we know it's not right to send the content
    *
    * @param response
   * @return Either[PageWithStoryPackage, Result]
   */
  def responseToModelOrResult(pageParam: Option[String])(response: ItemResponse)(implicit request: RequestHeader): Either[PageWithStoryPackage, Result] = {
    val supportedContent = response.content.filter(isSupported).map(Content(_))
    val page = pageParam.map(ParseBlockId.apply)
    val supportedContentResult = ModelOrResult(supportedContent, response)
    val content: Either[PageWithStoryPackage, Result] = supportedContentResult.left.flatMap { content =>
      (content, page) match {
        case (minute: Article, None) if minute.isUSMinute =>
          Left(MinutePage(minute, StoryPackages(minute, response)))
        case (liveBlog: Article, None/*no page param*/) if liveBlog.isLiveBlog =>
          createLiveBlogModel(liveBlog, response, None)
        case (liveBlog: Article, Some(Some(requiredBlockId))/*page param specified and valid format*/) if liveBlog.isLiveBlog =>
          createLiveBlogModel(liveBlog, response, Some(requiredBlockId))
        case (article: Article, None) => Left(ArticlePage(article, StoryPackages(article, response)))
        case _ =>
          Right(NotFound)
      }
    }

    content
  }

  def createLiveBlogModel(liveBlog: Article, response: ItemResponse, maybeRequiredBlockId: Option[String]) = {

    val pageSize = if (liveBlog.content.tags.tags.map(_.id).contains("sport/sport")) 30 else 10
    val liveBlogPageModel = LiveBlogCurrentPage(
      pageSize = pageSize,
      liveBlog.content.fields.blocks,
      maybeRequiredBlockId
    )
    liveBlogPageModel match {
      case Some(pageModel) =>

        val cacheTime =
          if (!pageModel.currentPage.isArchivePage && liveBlog.fields.isLive)
            liveBlog.metadata.cacheTime
          else if (liveBlog.fields.lastModified > DateTime.now(liveBlog.fields.lastModified.getZone) - 1.hour)
            CacheTime.RecentlyUpdated
          else if (liveBlog.fields.lastModified > DateTime.now(liveBlog.fields.lastModified.getZone) - 24.hours)
            CacheTime.LastDayUpdated
          else
            CacheTime.NotRecentlyUpdated

        val liveBlogCache = liveBlog.copy(
          content = liveBlog.content.copy(
            metadata = liveBlog.content.metadata.copy(
              cacheTime = cacheTime)))
        Left(LiveBlogPage(liveBlogCache, pageModel, StoryPackages(liveBlog, response)))
      case None => Right(NotFound)
    }

  }

}

object ParseBlockId extends RegexParsers {
  def apply(input: String): Option[String] = {
    def withParser: Parser[Unit] = "with:" ^^ { _ => () }
    def block: Parser[Unit] = "block-" ^^ { _ => () }
    def id: Parser[String] = "[a-zA-Z0-9]+".r
    def expr: Parser[String] = withParser ~> block ~> id

    parse(expr, input) match {
      case Success(matched, _) => Some(matched)
      case _ => None
    }
  }
}
