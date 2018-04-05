package controllers

import com.gu.contentapi.client.model.v1.{ItemResponse, Package, Content => ApiContent}
import common._
import common.`package`.NotFound
import conf.switches.Switches.InlineEmailStyles
import contentapi.ContentApiClient
import controllers.ArticleController._
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.LiveBlogHelpers._
import model.ParseBlockId.{InvalidFormat, ParsedBlockId}
import model._
import model.liveblog._
import org.joda.time.DateTime
import pages.{ArticleEmailHtmlPage, ArticleHtmlPage, LiveBlogHtmlPage, MinuteHtmlPage}
import play.api.libs.functional.syntax._
import play.api.libs.json.{Json, _}
import play.api.mvc._
import play.twirl.api.Html

import scala.concurrent.Future

case class ArticlePage(article: Article, related: RelatedContent) extends PageWithStoryPackage
case class MinutePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

class ArticleController(
  contentApiClient: ContentApiClient,
  val controllerComponents: ControllerComponents
)(implicit context: ApplicationContext)
  extends BaseController
    with RendersItemResponse
    with Logging
    with ImplicitControllerExecutionContext {

  override def canRender(i: ItemResponse): Boolean = i.content.exists(ArticleController.isSupported)
  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = render(path, Some(Canonical))(buildResponse)

  def renderLiveBlogUpdates: Future[Result] = ???

  def renderLiveBlogJson(
    path: String,
    lastUpdate: Option[String],
    rendered: Option[Boolean],
    isLivePage: Option[Boolean]
  ): Action[AnyContent] = {

    Action.async { implicit request =>
      val range = lastUpdate.map(ParseBlockId.fromBlockId) match {
        case Some(ParsedBlockId(id)) => Some(SinceBlockId(id))
        case Some(InvalidFormat) => None
        case None => Some(Canonical)
      }

      range match {
        case Some(r) =>
          render(path, range) { page =>
            r match {
              case since: SinceBlockId => renderNewerUpdates(page, since, isLivePage)
              case render if rendered.contains(true) => buildResponse(page)
              case block => blockText(page, 6)

            }
          }
        case None =>
          // indicates invalid block ID
          Future.successful(Cached(10)(WithoutRevalidationResult(NotFound)))
      }
    }
  }

  def renderLiveBlog(path: String, page: Option[String], format: Option[String]): Action[AnyContent] = {
    Action.async { implicit request =>
      val range = page.map(ParseBlockId.fromPageParam) match {
        case Some(ParsedBlockId(id)) => Some(PageWithBlock(id))
        case Some(InvalidFormat) => None
        case None => Some(Canonical)
      }

      range match {
        case _ if request.isEmail =>
          render(path, None)(buildResponse)
        case Some(r) =>
          render(path, range)(buildResponse)
        case None =>
          // indicates invalid block ID
          Future.successful(Cached(10)(WithoutRevalidationResult(NotFound)))
      }
    }
  }

  def renderArticle(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      val range = if (request.isEmail || request.isGuuiJson) {
        Some(ArticleBlocks)
      } else None

      render(path, range)(buildResponse)
    }
  }

  def renderJson(path: String): Action[AnyContent] = renderArticle(path)

  private[this] def render(path: String, range: Option[BlockRange])(transform: PageWithStoryPackage => Result)(implicit request: RequestHeader): Future[Result] = {
    val item = ArticleController.getFromCAPI(contentApiClient, path, range)

    item map { i =>
      val res = for {
        apiContent <- i.content.toRight(ContentNotFound)
        _ <- filterOnContentType(i)
        _ <- filterOnRedirect(request, i)
        page <- toPage(Content(apiContent), i.packages, range, request.isEmail)
        result = transform(page)
      } yield result

      handleErrors(res, i)
    } recover convertApiExceptionsWithoutEither
  }

  private[this] def toPage(content: ContentType, packages: Option[Seq[Package]], range: Option[BlockRange], isEmail: Boolean): Either[Error, PageWithStoryPackage] = {
    content match {
      case minute: Article if minute.isTheMinute =>
        Right(MinutePage(minute, StoryPackages(minute, packages)))
      // Enable an email format for 'Minute' content (which are actually composed as a LiveBlog), without changing the non-email display of the page
      case liveBlog: Article if liveBlog.isLiveBlog && isEmail =>
        Right(MinutePage(liveBlog, StoryPackages(liveBlog, packages)))
      case liveBlog: Article if liveBlog.isLiveBlog =>
        for {
          r <- range.toRight(MissingRange)
          m <- createLiveBlogModel(liveBlog, packages, r).toRight(ContentNotFound)
        } yield m
      case article: Article =>
        Right(ArticlePage(article, StoryPackages(article, packages)))
    }
  }

  private[this] def renderNewerUpdates(page: PageWithStoryPackage, lastUpdateBlockId: SinceBlockId, isLivePage: Option[Boolean])(implicit request: RequestHeader): Result = {
    val newBlocks = page.article.fields.blocks.toSeq.flatMap {
      _.requestedBodyBlocks.getOrElse(lastUpdateBlockId.around, Seq())
    }.takeWhile { block =>
      block.id != lastUpdateBlockId.lastUpdate
    }
    val blocksHtml = views.html.liveblog.liveBlogBlocks(newBlocks, page.article, Edition(request).timezone)
    val timelineHtml = views.html.liveblog.keyEvents("", model.KeyEventData(newBlocks, Edition(request).timezone))
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

  implicit val dateToTimestampWrites = play.api.libs.json.JodaWrites.JodaDateTimeNumberWrites
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

  private[this] def blockText(page: PageWithStoryPackage, number: Int)(implicit request: RequestHeader): Result = page match {
    case LiveBlogPage(liveBlog, _, _) =>
      val blocks =
        liveBlog.blocks.toSeq.flatMap { blocks =>
          blocks.requestedBodyBlocks.get(Canonical.firstPage).toSeq.flatMap { bodyBlocks: Seq[BodyBlock] =>
            bodyBlocks.collect {
              case BodyBlock(id, html, summary, title, _, _, _, publishedAt, _, updatedAt, _, _) if html.trim.nonEmpty =>
                TextBlock(id, title, publishedAt, updatedAt, summary)
            }
          }
        }.take(number)
      Cached(page)(JsonComponent("blocks" -> Json.toJson(blocks)))
    case _ => Cached(600)(WithoutRevalidationResult(NotFound("Can only return block text for a live blog")))

  }

  private[this] def buildResponse(page: PageWithStoryPackage)(implicit request: RequestHeader): Result = {
    def asHtml(page: Page, html: Html)(implicit request: RequestHeader): Result = Cached(page)(RevalidatableResult.Ok(html))
    def asEmail(page: Page, html: Html)(implicit request: RequestHeader): Result = {
      Cached(page)(RevalidatableResult.Ok(if (InlineEmailStyles.isSwitchedOn) InlineStyles(html) else html))
    }
    def asJson(page: Page, html: Html)(implicit request: RequestHeader): Result = Cached(page)(JsonComponent(page, html))

    val isAmp = request.isAmp
    val isJson = request.isJson
    val isEmail = request.isEmail
    val notFound = Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound))

    page match {
      case ampArticle: ArticlePage if isAmp => asHtml(page, views.html.articleAMP(ampArticle))
      case emailArticle: ArticlePage if isEmail => asEmail(page, ArticleEmailHtmlPage.html(emailArticle))
      case jsonArticle: ArticlePage if isJson => asJson(page, views.html.fragments.articleBody(jsonArticle))
      case article: ArticlePage => asHtml(page, ArticleHtmlPage.html(article))

      case ampBlog: LiveBlogPage if isAmp => asHtml(page, views.html.liveBlogAMP(ampBlog))
      case emailBlog: LiveBlogPage if isEmail => notFound
      case jsonBlog: LiveBlogPage if isJson => asJson(page, views.html.liveblog.liveBlogBody(jsonBlog))
      case blog: LiveBlogPage => asHtml(page, LiveBlogHtmlPage.html(blog))

      case ampMinute: MinutePage if isAmp => notFound
      case emailMinute: MinutePage if isEmail => asEmail(page, ArticleEmailHtmlPage.html(emailMinute))
      case jsonMinute: MinutePage if isJson => asJson(page, ArticleEmailHtmlPage.html(jsonMinute))
      case minute: MinutePage => asHtml(page, MinuteHtmlPage.html(minute))
    }
  }
}

object ArticleController {

  sealed trait Error
  object ContentNotFound extends Error
  object InvalidContentType extends Error
  object MissingRange extends Error
  case class Redirect(result: Result) extends Error

  def isSupported(c: ApiContent): Boolean = c.isArticle || c.isLiveBlog || c.isSudoku

  def getFromCAPI(client: ContentApiClient, path: String, range: Option[BlockRange])(implicit request: RequestHeader): Future[ItemResponse] = {
    val edition = Edition(request)

    val capiItem = client.item(path, edition)
      .showTags("all")
      .showFields("all")
      .showReferences("all")
      .showAtoms("all")

    val capiItemWithBlocks = range.map { blockRange =>
      val blocksParam = blockRange.query.map(_.mkString(",")).getOrElse("body")
      capiItem.showBlocks(blocksParam)
    }.getOrElse(capiItem)

    client.getResponse(capiItemWithBlocks)
  }

  def handleErrors(res: Either[Error, Result], ir: ItemResponse)(implicit request: RequestHeader): Result = {
    val notFound = Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound))

    res match {
      case Right(okay) => okay
      case Left(ContentNotFound) | Left(InvalidContentType) => ContentRedirect.internal(request, ir).getOrElse(notFound)
      case Left(MissingRange) => notFound
      case Left(Redirect(r)) => r
    }
  }

  def filterOnContentType(response: ItemResponse): Either[Error, Unit] = {
    val content = response.content.toRight(ContentNotFound)

    content.flatMap { c =>
      if (c.isArticle || c.isLiveBlog || c.isSudoku) Right(Unit)
      else Left(InvalidContentType)
    }
  }

  def filterOnRedirect(request: RequestHeader, response: ItemResponse): Either[Error, Unit] = {
    ContentRedirect.canonical(request, response).map(ArticleController.Redirect.apply).toLeft(Unit)
  }



}
