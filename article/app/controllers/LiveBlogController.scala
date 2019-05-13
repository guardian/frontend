package controllers

import com.gu.contentapi.client.model.v1.{Blocks, ItemResponse, Content => ApiContent}
import common.`package`.{convertApiExceptions => _, renderFormat => _}
import common.{JsonComponent, RichRequestHeader, _}
import contentapi.ContentApiClient
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.LiveBlogHelpers._
import model.ParseBlockId.{InvalidFormat, ParsedBlockId}
import model.{ApplicationContext, Canonical, _}
import pages.{ArticleEmailHtmlPage, LiveBlogHtmlPage, MinuteHtmlPage}
import play.api.libs.ws.WSClient
import play.api.mvc._
import services.CAPILookup
import views.support.RenderOtherStatus
import implicits.{AmpFormat, EmailFormat, HtmlFormat, JsonFormat}
import model.dotcomponents.DotcomponentsDataModel
import play.api.libs.json.Json
import renderers.RemoteRenderer
import services.dotcomponents.{LocalRender, RemoteRender, RemoteRenderAMP, RenderingTierPicker}

import scala.concurrent.Future

case class MinutePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

class LiveBlogController(
  contentApiClient: ContentApiClient,
  val controllerComponents: ControllerComponents,
  ws: WSClient,
  remoteRenderer: renderers.RemoteRenderer = RemoteRenderer(),
  renderingTierPicker: RenderingTierPicker = RenderingTierPicker()
)(implicit context: ApplicationContext)
  extends BaseController with
    RendersItemResponse with
    Logging with
    ImplicitControllerExecutionContext {

  val capiLookup: CAPILookup = new CAPILookup(contentApiClient)


  // we support liveblogs and also articles, so that minutes work
  private def isSupported(c: ApiContent) = c.isLiveBlog || c.isArticle
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = {
    mapModel(path, Canonical)((page, blocks) => render(path, page, blocks))
  }

  def renderEmail(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      mapModel(path, ArticleBlocks)((page, blocks) => render(path, page, blocks))
    }
  }

  // Main entry points

  def renderArticle(path: String, page: Option[String] = None, format: Option[String] = None): Action[AnyContent] = {
    Action.async { implicit request =>
      def renderWithRange(range: BlockRange): Future[Result] = {
        mapModel(path, range)((page, blocks) => {
          renderingTierPicker.getTier(page, blocks) match {
            case RemoteRender => remoteRenderer.getArticle(ws, path, page, blocks)
            case RemoteRenderAMP => remoteRenderer.getAMPArticle(ws, path, page, blocks)
            case LocalRender => render(path, page, blocks)
          }
        })
      }

      page.map(ParseBlockId.fromPageParam) match {
        case Some(ParsedBlockId(id)) => renderWithRange(PageWithBlock(id)) // we know the id of a block
        case Some(InvalidFormat) => Future.successful(Cached(10)(WithoutRevalidationResult(NotFound))) // page param there but couldn't extract a block id
        case None => renderWithRange(Canonical) // no page param
      }
    }
  }

  def renderJson(
    path: String,
    lastUpdate: Option[String],
    rendered: Option[Boolean],
    isLivePage: Option[Boolean]
  ): Action[AnyContent] = {

    Action.async { implicit request =>
      val range = getRange(lastUpdate, rendered)

      mapModel(path, range) {
        case (liveblog: LiveBlogPage, blocks) => getJson(path, liveblog, range, isLivePage, blocks)
        case (minute: MinutePage, blocks) => render(path, minute, blocks)
        case _ => Future { Cached(600)(WithoutRevalidationResult(NotFound)) }
      }
    }
  }

  // Helper methods

  private[this] def render(
    path: String,
    page: PageWithStoryPackage,
    blocks: Blocks
  )(implicit request: RequestHeader): Future[Result] = {
    val isMinute = page.isInstanceOf[MinutePage]

    Future.successful {
      (page, request.getRequestFormat) match {
        case (minute: MinutePage, JsonFormat) => common.renderJson(views.html.fragments.minuteBody(minute), minute)
        case (minute: MinutePage, EmailFormat) => common.renderEmail(ArticleEmailHtmlPage.html(minute), minute)
        case (minute: MinutePage, HtmlFormat) => common.renderHtml(MinuteHtmlPage.html(minute), minute)

        case (blog: LiveBlogPage, JsonFormat) if request.isGuui => renderGuuiJson(path, blog, blocks)
        case (blog: LiveBlogPage, JsonFormat) => common.renderJson( views.html.liveblog.liveBlogBody(blog), blog)
        case (blog: LiveBlogPage, EmailFormat) => common.renderEmail(LiveBlogHtmlPage.html(blog), blog)
        case (blog: LiveBlogPage, HtmlFormat) => common.renderHtml(LiveBlogHtmlPage.html(blog), blog)
        case (blog: LiveBlogPage, AmpFormat) if request.isGuui => common.renderHtml(views.html.liveBlogAMP(blog), blog)
        case (blog: LiveBlogPage, AmpFormat) => common.renderHtml(views.html.liveBlogAMP(blog), blog)

        case _ => NotFound
      }
    }
  }

  private[this] def getRange(lastUpdate: Option[String], rendered: Option[Boolean]): BlockRange = {
    lastUpdate.map(ParseBlockId.fromBlockId) match {
      case Some(ParsedBlockId(id)) => SinceBlockId(id)
      case _ => Canonical
    }
  }

  private[this] def getJsonForFronts(liveblog: LiveBlogPage)(implicit request: RequestHeader): Future[Result] = {
    Future {
      Cached(liveblog)(JsonComponent("blocks" -> model.LiveBlogHelpers.blockTextJson(liveblog, 6)))
    }
  }

  private[this] def getJson(
    path: String,
    liveblog: PageWithStoryPackage,
    range: BlockRange,
    isLivePage: Option[Boolean],
    blocks: Blocks
  )(implicit request: RequestHeader): Future[Result] = {

    range match {
      case SinceBlockId(lastBlockId) => renderNewerUpdatesJson(liveblog, SinceBlockId(lastBlockId), isLivePage)
      case _ => render(path, liveblog, blocks)
    }
  }

  private[this] def renderNewerUpdatesJson(page: PageWithStoryPackage, lastUpdateBlockId: SinceBlockId, isLivePage: Option[Boolean])(implicit request: RequestHeader): Future[Result] = {
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

    Future {
      Cached(page)(JsonComponent(allPagesJson ++ livePageJson ++ mostRecent: _*))
    }
  }

  private[this] def renderGuuiJson(
    path: String,
    blog: LiveBlogPage,
    blocks: Blocks
  )(implicit request: RequestHeader): Result = {
    val model = DotcomponentsDataModel.fromArticle(blog, request, blocks)
    val json = DotcomponentsDataModel.toJsonString(model)

    common.renderJson(json, blog).as("application/json")
  }

  private[this] def mapModel(path: String, range: BlockRange)(render: (PageWithStoryPackage, Blocks) => Future[Result])(implicit request: RequestHeader): Future[Result] = {
    capiLookup
      .lookup(path, Some(range))
      .map(responseToModelOrResult(range))
      .recover(convertApiExceptions)
      .flatMap {
        case Left((model, blocks)) => render(model, blocks)
        case Right(other) => Future.successful(RenderOtherStatus(other))
      }
  }

  private[this] def responseToModelOrResult(range: BlockRange)(response: ItemResponse)(implicit request: RequestHeader): Either[(PageWithStoryPackage, Blocks), Result] = {
    val supportedContent: Option[ContentType] = response.content.filter(isSupported).map(Content(_))
    val supportedContentResult: Either[ContentType, Result] = ModelOrResult(supportedContent, response)
    val blocks = response.content.flatMap(_.blocks).getOrElse(Blocks())

    val content = supportedContentResult.left.flatMap {
      case minute: Article if minute.isTheMinute =>
        Left(MinutePage(minute, StoryPackages(minute.metadata.id, response)), blocks)
      case liveBlog: Article if liveBlog.isLiveBlog && request.isEmail =>
        Left(MinutePage(liveBlog, StoryPackages(liveBlog.metadata.id, response)), blocks)
      case liveBlog: Article if liveBlog.isLiveBlog =>
        createLiveBlogModel(liveBlog, response, range).left.map(_ -> blocks)
    }

    content
  }

}
