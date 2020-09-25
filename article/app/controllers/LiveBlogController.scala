package controllers

import com.gu.contentapi.client.model.v1.{Blocks, ItemResponse, Content => ApiContent}
import common.`package`.{convertApiExceptions => _, renderFormat => _}
import common.{JsonComponent, RichRequestHeader, _}
import contentapi.ContentApiClient
import model.Cached.WithoutRevalidationResult
import model.LiveBlogHelpers._
import model.ParseBlockId.{InvalidFormat, ParsedBlockId}
import model.{ApplicationContext, Canonical, _}
import pages.{ArticleEmailHtmlPage, LiveBlogHtmlPage, MinuteHtmlPage}
import play.api.libs.ws.WSClient
import play.api.mvc._
import services.CAPILookup
import views.support.RenderOtherStatus
import implicits.{AmpFormat, HtmlFormat}
import model.dotcomponents.{DCRDataModel, DotcomponentsDataModel}
import renderers.RemoteRenderer

import scala.concurrent.Future

import model.dotcomponents.PageType

case class MinutePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

class LiveBlogController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    ws: WSClient,
    remoteRenderer: renderers.RemoteRenderer = RemoteRenderer(),
)(implicit context: ApplicationContext)
    extends BaseController
    with Logging
    with ImplicitControllerExecutionContext {

  val capiLookup: CAPILookup = new CAPILookup(contentApiClient)

  // we support liveblogs and also articles, so that minutes work
  private def isSupported(c: ApiContent) = c.isLiveBlog || c.isArticle

  // Main entry points

  def renderEmail(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      mapModel(path, ArticleBlocks) {
        case (minute: MinutePage, blocks) =>
          Future.successful(common.renderEmail(ArticleEmailHtmlPage.html(minute), minute))
        case (blog: LiveBlogPage, blocks) => Future.successful(common.renderEmail(LiveBlogHtmlPage.html(blog), blog))
        case _                            => Future.successful(NotFound)
      }
    }
  }

  def renderArticle(path: String, page: Option[String] = None, format: Option[String] = None): Action[AnyContent] = {
    Action.async { implicit request =>
      def renderWithRange(range: BlockRange): Future[Result] = {
        mapModel(path, range) { (page, blocks) =>
          {
            val isAmpSupported = page.article.content.shouldAmplify
            val pageType: PageType = PageType(page, request, context)
            (page, request.getRequestFormat) match {
              case (minute: MinutePage, HtmlFormat) =>
                Future.successful(common.renderHtml(MinuteHtmlPage.html(minute), minute))
              case (blog: LiveBlogPage, HtmlFormat) =>
                Future.successful(common.renderHtml(LiveBlogHtmlPage.html(blog), blog))
              case (blog: LiveBlogPage, AmpFormat) if isAmpSupported =>
                remoteRenderer.getAMPArticle(ws, blog, blocks, pageType)
              case (blog: LiveBlogPage, AmpFormat) =>
                Future.successful(common.renderHtml(LiveBlogHtmlPage.html(blog), blog))
              case _ => Future.successful(NotFound)
            }
          }
        }
      }

      page.map(ParseBlockId.fromPageParam) match {
        case Some(ParsedBlockId(id)) => renderWithRange(PageWithBlock(id)) // we know the id of a block
        case Some(InvalidFormat) =>
          Future.successful(
            Cached(10)(WithoutRevalidationResult(NotFound)),
          ) // page param there but couldn't extract a block id
        case None => renderWithRange(Canonical) // no page param
      }
    }
  }

  def renderJson(
      path: String,
      lastUpdate: Option[String],
      rendered: Option[Boolean],
      isLivePage: Option[Boolean],
  ): Action[AnyContent] = {

    Action.async { implicit request =>
      val range = getRange(lastUpdate, rendered)

      mapModel(path, range) {
        case (blog: LiveBlogPage, blocks) if rendered.contains(false) => getJsonForFronts(blog)
        case (blog: LiveBlogPage, blocks) if request.forceDCR         => Future.successful(renderGuuiJson(path, blog, blocks))
        case (blog: LiveBlogPage, blocks)                             => getJson(path, blog, range, isLivePage, blocks)
        case (minute: MinutePage, blocks) =>
          Future.successful(common.renderJson(views.html.fragments.minuteBody(minute), minute))
        case _ => Future { Cached(600)(WithoutRevalidationResult(NotFound)) }
      }

    }
  }

  // Helper methods

  private[this] def getRange(lastUpdate: Option[String], rendered: Option[Boolean]): BlockRange = {
    lastUpdate.map(ParseBlockId.fromBlockId) match {
      case Some(ParsedBlockId(id)) => SinceBlockId(id)
      case _                       => Canonical
    }
  }

  private[this] def getJsonForFronts(liveblog: LiveBlogPage)(implicit request: RequestHeader): Future[Result] = {
    Future {
      Cached(liveblog)(JsonComponent("blocks" -> model.LiveBlogHelpers.blockTextJson(liveblog, 6)))
    }
  }

  private[this] def getJson(
      path: String,
      liveblog: LiveBlogPage,
      range: BlockRange,
      isLivePage: Option[Boolean],
      blocks: Blocks,
  )(implicit request: RequestHeader): Future[Result] = {

    range match {
      case SinceBlockId(lastBlockId) => renderNewerUpdatesJson(liveblog, SinceBlockId(lastBlockId), isLivePage)
      case _                         => Future.successful(common.renderJson(views.html.liveblog.liveBlogBody(liveblog), liveblog))
    }
  }

  private[this] def renderNewerUpdatesJson(
      page: PageWithStoryPackage,
      lastUpdateBlockId: SinceBlockId,
      isLivePage: Option[Boolean],
  )(implicit request: RequestHeader): Future[Result] = {
    val newBlocks = page.article.fields.blocks.toSeq
      .flatMap {
        _.requestedBodyBlocks.getOrElse(lastUpdateBlockId.around, Seq())
      }
      .takeWhile { block =>
        block.id != lastUpdateBlockId.lastUpdate
      }
    val blocksHtml = views.html.liveblog.liveBlogBlocks(newBlocks, page.article, Edition(request).timezone)
    val timelineHtml = views.html.liveblog.keyEvents("", model.KeyEventData(newBlocks, Edition(request).timezone))

    val allPagesJson = Seq(
      "timeline" -> timelineHtml,
      "numNewBlocks" -> newBlocks.size,
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
      blocks: Blocks,
  )(implicit request: RequestHeader): Result = {
    val pageType: PageType = PageType(blog, request, context)
    val model = DotcomponentsDataModel.fromArticle(blog, request, blocks, pageType)
    val json = DCRDataModel.toJson(model)
    common.renderJson(json, blog).as("application/json")
  }

  private[this] def mapModel(path: String, range: BlockRange)(
      render: (PageWithStoryPackage, Blocks) => Future[Result],
  )(implicit request: RequestHeader): Future[Result] = {
    capiLookup
      .lookup(path, Some(range))
      .map(responseToModelOrResult(range))
      .recover(convertApiExceptions)
      .flatMap {
        case Left((model, blocks)) => render(model, blocks)
        case Right(other)          => Future.successful(RenderOtherStatus(other))
      }
  }

  private[this] def responseToModelOrResult(
      range: BlockRange,
  )(response: ItemResponse)(implicit request: RequestHeader): Either[(PageWithStoryPackage, Blocks), Result] = {
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
      case unknown => {
        log.error(s"Requested non-liveblog: ${unknown.metadata.id}")
        Right(InternalServerError)
      }
    }

    content
  }

}
