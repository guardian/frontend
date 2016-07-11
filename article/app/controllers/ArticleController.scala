package controllers

import _root_.liveblog._
import com.gu.contentapi.client.model.v1.{ItemResponse, Content => ApiContent}
import common._
import conf.switches.Switches
import contentapi.ContentApiClient
import model.Cached.WithoutRevalidationResult
import model._
import model.liveblog.BodyBlock
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

class ArticleController extends Controller with RendersItemResponse with Logging with ExecutionContexts {

  private def isSupported(c: ApiContent) = c.isArticle || c.isLiveBlog || c.isSudoku
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = mapModel(path, Some(Canonical))(render(path, _))


  private def renderNewerUpdates(page: PageWithStoryPackage, lastUpdateBlockId: SinceBlockId, isLivePage: Option[Boolean])(implicit request: RequestHeader): Result = {
    val newBlocks = page.article.fields.blocks.toSeq.flatMap {
      _.requestedBodyBlocks.getOrElse(lastUpdateBlockId.around, Seq())
    }.takeWhile { block =>
      block.id != lastUpdateBlockId.lastUpdate
    }
    val blocksHtml = views.html.liveblog.liveBlogBlocks(newBlocks, page.article, Edition(request).timezone)
    val timelineHtml = views.html.liveblog.keyEvents("", KeyEventData(newBlocks, Edition(request).timezone))
    val allPagesJson = Seq(
      "timeline" -> timelineHtml,
      "numNewBlocks" -> newBlocks.size
    )
    val livePageJson = isLivePage.filter(_ == true).map { _ =>
      "html" -> blocksHtml
    }
    val mostRecent = newBlocks.headOption.map { block =>
      "mostRecentBlockId" -> s"block-${block.id}"
    }
    Cached(page)(JsonComponent((allPagesJson ++ livePageJson ++ mostRecent): _*))
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
      val blocks = liveBlog.blocks.toSeq.flatMap{_.requestedBodyBlocks.get(Canonical.firstPage).toSeq.flatMap(_.collect {
        case BodyBlock(id, html, _, title, _, _, _, publishedAt, _, updatedAt, _, _) if html.trim.nonEmpty =>
          TextBlock(id, title, publishedAt, updatedAt, html)
      })}.take(number)
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
      val range = page.map(ParseBlockId.fromPage) match {
        case Some(Some(id)) => Left(PageWithBlock(id)) // we know the id of a block
        case Some(None) => Right(NotFound) // page param there but couldn't extract a block id
        case None => Left(Canonical) // no page param
      }
      range.left.map { range =>
        mapModel(path, range = Some(range)) {// temporarily only ask for blocks too for things we know are new live blogs until until the migration is done and we can always use blocks
          render(path, _)
        }
      } match {
        case Left(f) => f
        case Right(status) => Future.successful(Cached(10)(WithoutRevalidationResult(status)))
      }
    }

  def renderLiveBlogJson(path: String, lastUpdate: Option[String], rendered: Option[Boolean], isLivePage: Option[Boolean]) = {
    Action.async { implicit request =>
      val range = lastUpdate.flatMap(blockId => ParseBlockId.fromBlockId(blockId)).orElse(rendered.flatMap(r => if (r == false) Some(Canonical) else None))
      mapModel(path, range = range) { model =>
        (range, rendered) match {
          case (Some(SinceBlockId(lastBlockId)), _) => renderNewerUpdates(model, SinceBlockId(lastBlockId), isLivePage)
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
      mapModel(path, range = if (request.isEmail) Some(Canonical) else None) {
        render(path, _)
      }
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

    log.info(s"Fetching article: $path for edition ${edition.id}: ${RequestLog(request)}")
    val capiItem = ContentApiClient.item(path, edition)
      .showTags("all")
      .showFields("all")
      .showReferences("all")
      .showAtoms("all")

    val capiItemWithBlocks = range.map(r => capiItem.showBlocks(r.query.map(_.mkString(",")).getOrElse("body"))).getOrElse(capiItem)
    ContentApiClient.getResponse(capiItemWithBlocks)

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
    val content: Either[PageWithStoryPackage, Result] = supportedContentResult.left.flatMap { content =>
      (content, range) match {
        case (minute: Article, None) if minute.isUSMinute =>
          Left(MinutePage(minute, StoryPackages(minute, response)))
        case (liveBlog: Article, Some(range)) if liveBlog.isLiveBlog =>
          createLiveBlogModel(liveBlog, response, range)
        case (article: Article, None) => Left(ArticlePage(article, StoryPackages(article, response)))
        case _ =>
          Right(NotFound)
      }
    }

    content
  }

  def createLiveBlogModel(liveBlog: Article, response: ItemResponse, range: BlockRange) = {

    val pageSize = if (liveBlog.content.tags.tags.map(_.id).contains("sport/sport")) 30 else 10
    val liveBlogPageModel =
      liveBlog.content.fields.blocks.map { blocks =>
        LiveBlogCurrentPage(
          pageSize = pageSize,
          blocks,
          range
        )
      } getOrElse None
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

  // the return types are so the compiler can check for me whether I've parsed (yet) or not

  def withParser: Parser[Unit] = "with:" ^^ { _ => () }
  def block: Parser[Unit] = "block-" ^^ { _ => () }
  def id: Parser[String] = "[a-zA-Z0-9]+".r
  def blockId = block ~> id

  def fromPage(input: String): Option[String] = {
    def expr: Parser[String] = withParser ~> blockId

    parse(expr, input) match {
      case Success(matched, _) => Some(matched)
      case _ => None
    }
  }

  def fromBlockId(input: String): Option[SinceBlockId] = {
    parse(blockId, input) match {
      case Success(matched, _) => Some(SinceBlockId(matched))
      case _ => None
    }
  }
}
