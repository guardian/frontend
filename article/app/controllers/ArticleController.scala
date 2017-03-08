package controllers

import _root_.liveblog._
import com.gu.contentapi.client.model.v1.{ItemResponse, Content => ApiContent}
import common._
import conf.switches.Switches
import contentapi.ContentApiClient
import controllers.ParseBlockId.{InvalidFormat, ParsedBlockId}
import model.Cached.WithoutRevalidationResult
import model._
import model.content.RecipeAtom
import model.liveblog.BodyBlock
import org.joda.time.DateTime
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
  val articleSchemas = ArticleSchemas
}

case class ArticlePage(article: Article, related: RelatedContent) extends PageWithStoryPackage
case class LiveBlogPage(article: Article, currentPage: LiveBlogCurrentPage, related: RelatedContent) extends PageWithStoryPackage
case class MinutePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

class ArticleController(contentApiClient: ContentApiClient)(implicit context: ApplicationContext) extends Controller with RendersItemResponse with Logging with ExecutionContexts {


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
    Cached(page)(JsonComponent(allPagesJson ++ livePageJson ++ mostRecent: _*))
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
      val blocks =
        liveBlog.blocks.toSeq.flatMap { blocks =>
        blocks.requestedBodyBlocks.get(Canonical.firstPage).toSeq.flatMap { bodyBlocks: Seq[BodyBlock] =>
          bodyBlocks.collect {
            case BodyBlock(id, html, _, title, _, _, _, publishedAt, _, updatedAt, _, _) if html.trim.nonEmpty =>
              TextBlock(id, title, publishedAt, updatedAt, html)
          }
        }
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
      val htmlResponse = () => {
        if (request.isAmp) views.html.liveBlogAMP(blog)
        else views.html.liveBlog(blog)
      }
      val jsonResponse = () => views.html.liveblog.liveBlogBody (blog)
      renderFormat(htmlResponse, jsonResponse, blog, Switches.all)

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
        else if (article.article.isExplore) views.html.articleExplore(article)
        else if (article.article.isImmersive) views.html.articleImmersive(article)
        else if (request.isAmp) views.html.articleAMP(article)
        else if (article.article.isRecipeArticle && false) {
          val recipeAtoms = article.article.content.atoms.fold(Nil: Seq[RecipeAtom])(_.recipes)
          val maybeMainImage: Option[ImageMedia] = article.article.content.elements.mainPicture.map{ _.images}
          views.html.recipeArticle(article, recipeAtoms, maybeMainImage)
        }
        else views.html.article(article)
      }

      val jsonResponse = () => views.html.fragments.articleBody(article)
      renderFormat(htmlResponse, jsonResponse, article, Switches.all)
  }

  def renderLiveBlog(path: String, page: Option[String] = None, format: Option[String] = None) =
    if (format.contains("email"))
      renderArticle(path)
    else
      Action.async { implicit request =>

        def renderWithRange(range: BlockRange) =
          mapModel(path, range = Some(range)) {// temporarily only ask for blocks too for things we know are new live blogs until until the migration is done and we can always use blocks
            render(path, _)
          }

        page.map(ParseBlockId.fromPageParam) match {
          case Some(ParsedBlockId(id)) => renderWithRange(PageWithBlock(id)) // we know the id of a block
          case Some(InvalidFormat) => Future.successful(Cached(10)(WithoutRevalidationResult(NotFound))) // page param there but couldn't extract a block id
          case None => renderWithRange(Canonical) // no page param
        }
      }

  def renderLiveBlogJson(path: String, lastUpdate: Option[String], rendered: Option[Boolean], isLivePage: Option[Boolean]) = {
    Action.async { implicit request =>

      def renderWithRange(range: BlockRange) =
        mapModel(path, Some(range)) { model =>
          range match {
            case SinceBlockId(lastBlockId) => renderNewerUpdates(model, SinceBlockId(lastBlockId), isLivePage)
            case _ => render(path, model)
          }
        }

      lastUpdate.map(ParseBlockId.fromBlockId) match {
        case Some(ParsedBlockId(id)) => renderWithRange(SinceBlockId(id))
        case Some(InvalidFormat) => Future.successful(Cached(10)(WithoutRevalidationResult(NotFound))) // page param there but couldn't extract a block id
        case None => if (rendered.contains(false)) mapModel(path) { model => blockText(model, 6) } else renderWithRange(Canonical) // no page param
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
      mapModel(path, range = if (request.isEmail) Some(ArticleBlocks) else None) {
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

    liveBlogPageModel.map { pageModel =>

      val isTransient = range match {
        case SinceBlockId(_) =>
          pageModel.currentPage.blocks.isEmpty
        case _ =>
          !pageModel.currentPage.isArchivePage
      }

      val cacheTime = if (isTransient && liveBlog.fields.isLive)
        liveBlog.metadata.cacheTime
      else
        CacheTime.NotRecentlyUpdated

      val liveBlogCache = liveBlog.copy(
        content = liveBlog.content.copy(
          metadata = liveBlog.content.metadata.copy(
            cacheTime = cacheTime)))
      Left(LiveBlogPage(liveBlogCache, pageModel, StoryPackages(liveBlog, response)))

    }.getOrElse(Right(NotFound))

  }

}

object ParseBlockId extends RegexParsers {

  sealed trait ParseResult { def toOption: Option[String] }
  case object InvalidFormat extends ParseResult { val toOption = None }
  case class ParsedBlockId(blockId: String) extends ParseResult { val toOption = Some(blockId) }

  private def withParser: Parser[Unit] = "with:" ^^ { _ => () }
  private def block: Parser[Unit] = "block-" ^^ { _ => () }
  private def id: Parser[String] = "[a-zA-Z0-9]+".r
  private def blockId = block ~> id

  def fromPageParam(input: String): ParseResult = {
    def expr: Parser[String] = withParser ~> blockId

    parse(expr, input) match {
      case Success(matched, _) => ParsedBlockId(matched)
      case _ => InvalidFormat
    }
  }

  def fromBlockId(input: String): ParseResult = {
    parse(blockId, input) match {
      case Success(matched, _) => ParsedBlockId(matched)
      case _ => InvalidFormat
    }
  }
}
