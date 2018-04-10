package controllers

import com.gu.contentapi.client.model.v1.{ItemResponse, Package, Content => ApiContent}
import common._
import conf.Configuration
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
import play.api.Logger
import play.api.libs.functional.syntax._
import play.api.libs.json.{Json, _}
import play.api.libs.ws.WSClient
import play.api.mvc._
import play.twirl.api.Html

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

case class ArticlePage(article: Article, related: RelatedContent) extends PageWithStoryPackage
case class MinutePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

class ArticleController(
  contentApiClient: ContentApiClient,
  val controllerComponents: ControllerComponents,
  ws: WSClient
)(implicit context: ApplicationContext)
  extends BaseController
    with RendersItemResponse
    with Logging
    with ImplicitControllerExecutionContext {

  override def canRender(i: ItemResponse): Boolean = i.content.exists(ArticleController.isSupported)
  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = render(path, Some(Canonical))(buildResponse)

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
              case since: SinceBlockId => renderLiveBlogUpdates(page, since, isLivePage)
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

      if (request.isGuui) {
        renderAsync(path, range)(renderFromGuui(path, _))
      } else {
        render(path, range)(buildResponse)
      }
    }
  }

  def renderJson(path: String): Action[AnyContent] = renderArticle(path)

  private[this] def render(
    path: String,
    range: Option[BlockRange]
  )(transform: PageWithStoryPackage => Result)(implicit request: RequestHeader): Future[Result] = {

    renderAsync(path, range)(page => Future.successful(transform(page)))
  }

  def renderAsync(
    path: String,
    range: Option[BlockRange]
  )(transform: PageWithStoryPackage => Future[Result])(implicit request: RequestHeader): Future[Result] = {

    val item = getFromCAPI(contentApiClient, path, range)

    // need to access errors and item
    val result = for {
      item <- item
      apiContent <- getOrNotFound(item)
      _ <- checkValidContentType(apiContent)
      _ <- checkRedirects(request, item)
      page <- toPage(Content(apiContent), item.packages, range, request.isEmail)
      result <- handleInternaErrors(transform(page), item)
    } yield result

    // handle internal errors
    val handled = for {
      item <- item
      handled <- handleInternaErrors(result, item)
    } yield handled

    handled recover convertApiExceptionsWithoutEither
  }

  private[this] def toPage(
    content: ContentType,
    packages: Option[Seq[Package]],
    range: Option[BlockRange],
    isEmail: Boolean
  ): Future[PageWithStoryPackage] = {

    content match {
      case minute: Article if minute.isTheMinute =>
        Future.successful(MinutePage(minute, StoryPackages(minute, packages)))
      // Enable an email format for 'Minute' content (which are actually composed as a LiveBlog), without changing the non-email display of the page
      case liveBlog: Article if liveBlog.isLiveBlog && isEmail =>
        Future.successful(MinutePage(liveBlog, StoryPackages(liveBlog, packages)))
      case liveBlog: Article if liveBlog.isLiveBlog =>
        for {
          r <- range.map(Future.successful).getOrElse(Future.failed(MissingRange))
          m <- createLiveBlogModel(liveBlog, packages, r).map(Future.successful).getOrElse(Future.failed(ContentNotFound))
        } yield m
      case article: Article =>
        Future.successful(ArticlePage(article, StoryPackages(article, packages)))
    }
  }

  private[this] def renderLiveBlogUpdates(
    page: PageWithStoryPackage,
    lastUpdateBlockId: SinceBlockId,
    isLivePage: Option[Boolean]
  )(implicit request: RequestHeader): Result = {

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

  def renderFromGuui(path: String, model: PageWithStoryPackage)(implicit request: RequestHeader): Future[Result] = {
    def remoteRenderArticle(payload: String): Future[String] = ws.url(Configuration.rendering.renderingEndpoint)
      .withRequestTimeout(2000.millis)
      .addHttpHeaders("Content-Type" -> "application/json")
      .post(payload)
      .map((response) =>
        response.body
      )

    model match {
      case article : ArticlePage =>
        val contentFieldsJson = if (request.isGuui) List("contentFields" -> Json.toJson(ContentFields(article.article))) else List()
        val jsonResponse = () => List(("html", views.html.fragments.articleBody(article))) ++ contentFieldsJson
        val jsonPayload = JsonComponent.jsonFor(model, jsonResponse():_*)
        remoteRenderArticle(jsonPayload).map(s => {
          Cached(article){ RevalidatableResult.Ok(Html(s)) }
        })
      case _ => throw new Exception("Remote render not supported for this content type")
    }
  }
}

object ArticleController {

  object ContentNotFound extends Exception
  object InvalidContentType extends Exception
  object MissingRange extends Exception
  case class Redirect(result: Result) extends Exception

  def handleInternaErrors(
    result: Future[Result],
    item: ItemResponse
  )(implicit request: RequestHeader,
    ec: ExecutionContext,
    ap: ApplicationContext,
    log: Logger
  ): Future[Result] = {
    val notFound = Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound))

    result recover {
      case ContentNotFound | InvalidContentType => ContentRedirect.internal(request, item).getOrElse(notFound)
      case MissingRange => notFound
      case Redirect(result) => result
    }
  }

  def checkRedirects(request: RequestHeader, item: ItemResponse)(implicit ec: ExecutionContext): Future[Unit] = {
    ContentRedirect.canonical(request, item) match {
      case Some(r) => Future.failed(Redirect(r))
      case None => Future.successful(())
    }
  }

  def checkValidContentType(content: ApiContent)(implicit ec: ExecutionContext): Future[Unit] = {
    if (content.isArticle || content.isLiveBlog || content.isSudoku) Future.successful(())
    else Future.failed(InvalidContentType)
  }

  def getOrNotFound(item: ItemResponse)(implicit ec: ExecutionContext): Future[ApiContent] = {
    item.content match {
      case Some(content) => Future.successful(content)
      case None => Future.failed(ContentNotFound)
    }
  }

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
}
