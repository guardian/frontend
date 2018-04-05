package controllers

import com.gu.contentapi.client.model.v1.{ItemResponse, Package, Content => ApiContent}
import common._
import conf.switches.Switches
import conf.switches.Switches.InlineEmailStyles
import contentapi.ContentApiClient
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
import views.support._

import scala.concurrent.Future

case class ArticlePage(article: Article, related: RelatedContent) extends PageWithStoryPackage
case class MinutePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

class ArticleController(contentApiClient: ContentApiClient, val controllerComponents: ControllerComponents)(implicit context: ApplicationContext) extends BaseController
    with RendersItemResponse with Logging with ImplicitControllerExecutionContext {

  private def isSupported(c: ApiContent) = c.isArticle || c.isLiveBlog || c.isSudoku
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = mapModel(path, Some(Canonical))(page => render(page))


  private def renderNewerUpdates(page: PageWithStoryPackage, lastUpdateBlockId: SinceBlockId, isLivePage: Option[Boolean])(implicit request: RequestHeader): Result = {
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

  private def blockText(page: PageWithStoryPackage, number: Int)(implicit request: RequestHeader): Result = page match {
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

  private def noAMP(renderPage: => Result)(implicit  request: RequestHeader): Result = {
    if (request.isAmp) NotFound
    else renderPage
  }

  private def render(page: PageWithStoryPackage)(implicit request: RequestHeader) = page match {
    case blog: LiveBlogPage =>
      val htmlResponse = () => {
        if (request.isAmp) views.html.liveBlogAMP(blog)
        else LiveBlogHtmlPage.html(blog)
      }
      val jsonResponse = () => views.html.liveblog.liveBlogBody(blog)
      renderFormat(htmlResponse, jsonResponse, blog, Switches.all)

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

  def renderLiveBlog(path: String, page: Option[String] = None, format: Option[String] = None): Action[AnyContent] = {
    def renderWithRange(range: BlockRange)(implicit request: RequestHeader): Future[Result] = {
      // temporarily only ask for blocks too for things we know are new live blogs until until the migration is done and we can always use blocks
      mapModel(path, range = Some(range)) { page => render(page) }
    }

    if (format.contains("email")) {
      renderArticle(path)
    } else {
      Action.async { implicit request =>
        page.map(ParseBlockId.fromPageParam) match {
          case Some(ParsedBlockId(id)) => renderWithRange(PageWithBlock(id)) // we know the id of a block
          case Some(InvalidFormat) => Future.successful(Cached(10)(WithoutRevalidationResult(NotFound))) // page param there but couldn't extract a block id
          case None => renderWithRange(Canonical) // no page param
        }
      }

    }
  }

  def renderLiveBlogJson(path: String, lastUpdate: Option[String], rendered: Option[Boolean], isLivePage: Option[Boolean]): Action[AnyContent] = {
    Action.async { implicit request =>

      def renderWithRange(range: BlockRange) =
        mapModel(path, Some(range)) { page =>
          range match {
            case SinceBlockId(lastBlockId) => renderNewerUpdates(page, SinceBlockId(lastBlockId), isLivePage)
            case _ => render(page)
          }
        }

      lastUpdate.map(ParseBlockId.fromBlockId) match {
        case Some(ParsedBlockId(id)) => renderWithRange(SinceBlockId(id))
        case Some(InvalidFormat) => Future.successful(Cached(10)(WithoutRevalidationResult(NotFound))) // page param there but couldn't extract a block id
        case None => if (rendered.contains(false)) mapModel(path, Some(Canonical)) { model => blockText(model, 6) } else renderWithRange(Canonical) // no page param
      }
    }
  }

  def renderJson(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      val range = if (request.isGuuiJson) Some(ArticleBlocks) else None
      mapModel(path, range) { page => render(page) }
    }
  }

  sealed trait Error
  object ContentNotFound extends Error
  object InvalidContentType extends Error
  object MissingRange extends Error
  case class Redirect(result: Result) extends Error

  def filterOnContentType(c: ApiContent): Either[Error, Unit] = {
    if (c.isArticle || c.isLiveBlog || c.isSudoku) Right(Unit)
    else Left(InvalidContentType)
  }

  def filterOnRedirect(request: RequestHeader, response: ItemResponse): Either[Error, Unit] = {
    ContentRedirect.canonical(request, response).map(Redirect.apply).toLeft(Unit)
  }

  def buildResponse(page: PageWithStoryPackage)(implicit request: RequestHeader): Result = {
    val isAmp = request.isAmp
    val isJson = request.isJson
    val isEmail = request.isEmail
    val notFound = Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound))

    page match {
      case ampArticle: ArticlePage if isAmp => asHtml(page, views.html.articleAMP(ampArticle))
      case emailArticle: ArticlePage if isEmail => asEmail(page, ArticleEmailHtmlPage.html(emailArticle))
      case jsonArticle: ArticlePage if isJson => notFound
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

  // TODO check correct caching behaviour
  def asHtml(page: Page, html: Html)(implicit request: RequestHeader): Result = Cached(page)(RevalidatableResult.Ok(html))
  def asEmail(page: Page, html: Html)(implicit request: RequestHeader): Result = {
    Cached(page)(RevalidatableResult.Ok(if (InlineEmailStyles.isSwitchedOn) InlineStyles(html) else html))
  }
  def asJson(page: Page, html: Html)(implicit request: RequestHeader): Result = Cached(page)(JsonComponent(page, html))

  def handleErrors(res: Either[Error, Result], ir: ItemResponse)(implicit request: RequestHeader): Result = {
    val notFound = Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound))

    res match {
      case Right(okay) => okay
      case Left(ContentNotFound) | Left(InvalidContentType) => ContentRedirect.internal(request, ir).getOrElse(notFound)
      case Left(MissingRange) => notFound
      case Left(Redirect(r)) => r
    }
  }

  // AIM: be able to easily pass certain request types to Moon without unnecessary cleaning
  // AIM: to remove references to common or inline them
  def renderArticle(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      // TODO more logic for range for liveblogs etc.
      val range = if (request.isEmail) Some(ArticleBlocks) else None
      val item = getFromCAPI(path, range)

      item map { i =>
        val res = for {
          apiContent <- i.content.toRight(ContentNotFound)
          _ <- filterOnContentType(apiContent)
          _ <- filterOnRedirect(request, i)
          page <- toPage(Content(apiContent), i.packages, range, request.isEmail)
          result = buildResponse(page)
        } yield result

        handleErrors(res, i)
      } recover convertApiExceptionsWithoutEither
    }
  }

  // range: None means the url didn't include /live/, Some(...) means it did.  Canonical just means no url parameter
  // if we switch to using blocks instead of body for articles, then it no longer needs to be Optional
  def mapModel(path: String, range: Option[BlockRange] = None)(render: PageWithStoryPackage => Result)(implicit request: RequestHeader): Future[Result] = {
    getFromCAPI(path, range) map responseToModelOrResult(range) recover convertApiExceptions map {
      case Left(model) => render(model)
      case Right(other) => RenderOtherStatus(other)
    }
  }

  private def getFromCAPI(path: String, range: Option[BlockRange])(implicit request: RequestHeader): Future[ItemResponse] = {
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

  def toPage(content: ContentType, packages: Option[Seq[Package]], range: Option[BlockRange], isEmail: Boolean): Either[Error, PageWithStoryPackage] = {
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
        Left(MinutePage(minute, StoryPackages(minute, response.packages)))
        // Enable an email format for 'Minute' content (which are actually composed as a LiveBlog), without changing the non-email display of the page
      case liveBlog: Article if liveBlog.isLiveBlog && request.isEmail =>
        Left(MinutePage(liveBlog, StoryPackages(liveBlog, response.packages)))
      case liveBlog: Article if liveBlog.isLiveBlog =>
        range.flatMap {
          createLiveBlogModel(liveBlog, response.packages, _)
        }.toLeft(NotFound)
      case article: Article =>
        Left(ArticlePage(article, StoryPackages(article, response.packages)))
    }

    content
  }
}


