package controllers

import com.gu.contentapi.client.model.v1.{Block, Blocks, ItemResponse, Content => ApiContent}
import com.gu.contentapi.client.utils.format.{CulturePillar, LifestylePillar, NewsPillar, SportPillar}
import common.`package`.{convertApiExceptions => _, renderFormat => _}
import common.{JsonComponent, RichRequestHeader, _}
import contentapi.ContentApiClient
import experiments.{ActiveExperiments, LiveblogRendering}
import implicits.{AmpFormat, HtmlFormat}
import model.Cached.WithoutRevalidationResult
import model.LiveBlogHelpers._
import model.ParseBlockId.{InvalidFormat, ParsedBlockId}
import model.dotcomrendering.{DotcomRenderingDataModel, PageType}
import model.liveblog.BodyBlock
import model.liveblog.BodyBlock.{KeyEvent, SummaryEvent}
import model.{ApplicationContext, CanonicalLiveBlog, _}
import org.joda.time.{DateTime, DateTimeZone}
import pages.{ArticleEmailHtmlPage, LiveBlogHtmlPage, MinuteHtmlPage}
import play.api.libs.ws.WSClient
import play.api.mvc._
import play.twirl.api.Html
import renderers.DotcomRenderingService
import services.CAPILookup
import services.dotcomponents.DotcomponentsLogger
import views.support.RenderOtherStatus

import scala.concurrent.Future

case class MinutePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

class LiveBlogController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    ws: WSClient,
    remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService(),
)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  val capiLookup: CAPILookup = new CAPILookup(contentApiClient)

  // we support liveblogs and also articles, so that minutes work
  private def isSupported(c: ApiContent) = c.isLiveBlog || c.isArticle

  // Main entry points

  def renderEmail(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      mapModel(path, ArticleBlocks) {
        case (minute: MinutePage, _) =>
          Future.successful(common.renderEmail(ArticleEmailHtmlPage.html(minute), minute))
        case (blog: LiveBlogPage, _) => Future.successful(common.renderEmail(LiveBlogHtmlPage.html(blog), blog))
        case _                       => Future.successful(NotFound)
      }
    }
  }

  def renderArticle(path: String, page: Option[String] = None, filterKeyEvents: Option[Boolean]): Action[AnyContent] = {
    Action.async { implicit request =>
      val filter = shouldFilter(filterKeyEvents)
      page.map(ParseBlockId.fromPageParam) match {
        case Some(ParsedBlockId(id)) =>
          renderWithRange(path, PageWithBlock(id), filter) // we know the id of a block
        case Some(InvalidFormat) =>
          Future.successful(
            Cached(10)(WithoutRevalidationResult(NotFound)),
          ) // page param there but couldn't extract a block id
        case None => renderWithRange(path, CanonicalLiveBlog, filter) // no page param
      }
    }
  }

  def renderJson(
      path: String,
      lastUpdate: Option[String],
      rendered: Option[Boolean],
      isLivePage: Option[Boolean],
      filterKeyEvents: Option[Boolean],
  ): Action[AnyContent] = {
    Action.async { implicit request: Request[AnyContent] =>
      val filter = shouldFilter(filterKeyEvents)
      val range = getRange(lastUpdate)

      mapModel(path, range, filter) {
        case (blog: LiveBlogPage, _) if rendered.contains(false) => getJsonForFronts(blog)
        case (blog: LiveBlogPage, blocks) if request.forceDCR && lastUpdate.isEmpty =>
          Future.successful(renderGuuiJson(blog, blocks, filter))
        case (blog: LiveBlogPage, blocks) =>
          val capiAroundLatestBlocks =
            blocks.requestedBodyBlocks.getOrElse(Map.empty[String, Seq[Block]]).flatMap(_._2).toSeq
          getJson(blog, range, isLivePage, filter, capiAroundLatestBlocks)
        case (minute: MinutePage, _) =>
          Future.successful(common.renderJson(views.html.fragments.minuteBody(minute), minute))
        case _ =>
          Future {
            Cached(600)(WithoutRevalidationResult(NotFound))
          }
      }
    }
  }

  private[this] def renderWithRange(path: String, range: BlockRange, filterKeyEvents: Boolean)(implicit
      request: RequestHeader,
  ): Future[Result] = {
    mapModel(path, range, filterKeyEvents) { (page, blocks) =>
      {
        val isAmpSupported = page.article.content.shouldAmplify
        val pageType: PageType = PageType(page, request, context)
        (page, request.getRequestFormat) match {
          case (minute: MinutePage, HtmlFormat) =>
            Future.successful(common.renderHtml(MinuteHtmlPage.html(minute), minute))
          case (blog: LiveBlogPage, HtmlFormat) =>
            val dcrCouldRender = LiveBlogController.checkIfSupported(blog)
            val participatingInTest = ActiveExperiments.isParticipating(LiveblogRendering)
            val isRecent = !LiveBlogController.isNotRecent(blog)
            val theme = blog.article.content.metadata.format.getOrElse(ContentFormat.defaultContentFormat).theme
            val design = blog.article.content.metadata.format.getOrElse(ContentFormat.defaultContentFormat).design
            val display = blog.article.content.metadata.format.getOrElse(ContentFormat.defaultContentFormat).display
            val isDeadBlog = LiveBlogController.isDeadBlog(blog)
            val properties =
              Map(
                "participatingInTest" -> participatingInTest.toString,
                "dcrCouldRender" -> dcrCouldRender.toString,
                "theme" -> theme.toString,
                "design" -> design.toString,
                "display" -> display.toString,
                "isRecent" -> isRecent.toString,
                "isDead" -> isDeadBlog.toString,
                "isLiveBlog" -> "true",
              )
            val remoteRendering =
              shouldRemoteRender(request.forceDCROff, request.forceDCR, participatingInTest, dcrCouldRender)
            if (remoteRendering) {
              DotcomponentsLogger.logger.logRequest(s"liveblog executing in dotcomponents", properties, page)
              val pageType: PageType = PageType(blog, request, context)
              remoteRenderer.getArticle(ws, blog, blocks, pageType, filterKeyEvents)
            } else {
              DotcomponentsLogger.logger.logRequest(s"liveblog executing in web", properties, page)
              Future.successful(common.renderHtml(LiveBlogHtmlPage.html(blog), blog))
            }
          case (blog: LiveBlogPage, AmpFormat) if isAmpSupported =>
            remoteRenderer.getAMPArticle(ws, blog, blocks, pageType, filterKeyEvents)
          case (blog: LiveBlogPage, AmpFormat) =>
            Future.successful(common.renderHtml(LiveBlogHtmlPage.html(blog), blog))
          case _ => Future.successful(NotFound)
        }
      }

    }
  }

  def shouldRemoteRender(
      forceDCROff: Boolean,
      forceDCR: Boolean,
      participatingInTest: Boolean,
      dcrCouldRender: Boolean,
  ): Boolean = {
    // ?dcr=false, so never render DCR
    if (forceDCROff) false
    // ?dcr=true, so always render DCR
    else if (forceDCR) true
    // User is in the test and dcr supports this blog . No param passed
    else if (participatingInTest && dcrCouldRender) true
    else false
  }

  private[this] def getRange(lastUpdate: Option[String]): BlockRange = {
    lastUpdate.map(ParseBlockId.fromBlockId) match {
      case Some(ParsedBlockId(id)) => SinceBlockId(id)
      case _                       => CanonicalLiveBlog
    }
  }

  private[this] def getJsonForFronts(liveblog: LiveBlogPage)(implicit request: RequestHeader): Future[Result] = {
    Future {
      Cached(liveblog)(JsonComponent("blocks" -> model.LiveBlogHelpers.blockTextJson(liveblog, 6)))
    }
  }

  private[this] def getJson(
      liveblog: LiveBlogPage,
      range: BlockRange,
      isLivePage: Option[Boolean],
      filterKeyEvents: Boolean,
      capiBlocks: Seq[Block] = Seq.empty,
  )(implicit request: RequestHeader): Future[Result] = {
    val dcrCouldRender = LiveBlogController.checkIfSupported(liveblog)
    val participating = ActiveExperiments.isParticipating(LiveblogRendering)
    val remoteRender = shouldRemoteRender(request.forceDCROff, request.forceDCR, participating, dcrCouldRender)

    range match {
      case SinceBlockId(lastBlockId) =>
        renderNewerUpdatesJson(
          liveblog,
          SinceBlockId(lastBlockId),
          isLivePage,
          filterKeyEvents,
          remoteRender,
          capiBlocks,
        )
      case _ => Future.successful(common.renderJson(views.html.liveblog.liveBlogBody(liveblog), liveblog))
    }
  }

  private[this] def getNewBlocks(
      page: PageWithStoryPackage,
      lastUpdateBlockId: SinceBlockId,
      filterKeyEvents: Boolean,
  ): Seq[BodyBlock] = {
    val requestedBlocks = page.article.fields.blocks.toSeq.flatMap {
      _.requestedBodyBlocks.getOrElse(lastUpdateBlockId.around, Seq())
    }

    val filteredBlocks = if (filterKeyEvents) {
      requestedBlocks.filter(block => block.eventType == KeyEvent || block.eventType == SummaryEvent)
    } else requestedBlocks

    filteredBlocks.takeWhile { block =>
      block.id != lastUpdateBlockId.lastUpdate
    }
  }

  private[this] def getNewBlocks(
      blocks: Seq[Block],
      lastUpdateBlockId: SinceBlockId,
      filterKeyEvents: Boolean,
  ): Seq[Block] = {

    val filteredBlocks = if (filterKeyEvents) {
      blocks.filter(block => block.attributes.keyEvent.getOrElse(false) || block.attributes.summary.getOrElse(false))
    } else blocks

    filteredBlocks.takeWhile { block =>
      block.id != lastUpdateBlockId.lastUpdate
    }
  }

  private def getDCRBlocksHTML(page: LiveBlogPage, blocks: Seq[Block])(implicit
      request: RequestHeader,
  ): Future[Html] = {
    remoteRenderer.getBlocks(ws, page, blocks) map { result =>
      new Html(result)
    }
  }

  private[this] def renderNewerUpdatesJson(
      page: LiveBlogPage,
      lastUpdateBlockId: SinceBlockId,
      isLivePage: Option[Boolean],
      filterKeyEvents: Boolean,
      remoteRender: Boolean,
      capiBlocks: Seq[Block],
  )(implicit request: RequestHeader): Future[Result] = {

    val newBlocks = getNewBlocks(page, lastUpdateBlockId, filterKeyEvents)
    val newCapiBlocks = getNewBlocks(capiBlocks, lastUpdateBlockId, filterKeyEvents)

    val timelineHtml = views.html.liveblog.keyEvents(
      "",
      model.KeyEventData(newBlocks, Edition(request).timezone),
      filterKeyEvents,
    )

    for {
      blocksHtml <-
        if (remoteRender) {
          getDCRBlocksHTML(page, newCapiBlocks)
        } else {
          Future.successful(views.html.liveblog.liveBlogBlocks(newBlocks, page.article, Edition(request).timezone))
        }
    } yield {
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

      Cached(page)(JsonComponent(allPagesJson ++ livePageJson ++ mostRecent: _*))
    }
  }

  private[this] def renderGuuiJson(
      blog: LiveBlogPage,
      blocks: Blocks,
      filterKeyEvents: Boolean,
  )(implicit request: RequestHeader): Result = {
    val pageType: PageType = PageType(blog, request, context)
    val model = DotcomRenderingDataModel.forLiveblog(blog, blocks, request, pageType, filterKeyEvents)
    val json = DotcomRenderingDataModel.toJson(model)
    common.renderJson(json, blog).as("application/json")
  }

  private[this] def mapModel(path: String, range: BlockRange, filterKeyEvents: Boolean = false)(
      render: (PageWithStoryPackage, Blocks) => Future[Result],
  )(implicit request: RequestHeader): Future[Result] = {
    capiLookup
      .lookup(path, Some(range))
      .map(responseToModelOrResult(range, filterKeyEvents))
      .recover(convertApiExceptions)
      .flatMap {
        case Left((model, blocks)) => render(model, blocks)
        case Right(other)          => Future.successful(RenderOtherStatus(other))
      }
  }

  private[this] def responseToModelOrResult(
      range: BlockRange,
      filterKeyEvents: Boolean,
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
        createLiveBlogModel(
          liveBlog,
          response,
          range,
          filterKeyEvents,
        ).left
          .map(_ -> blocks)
      case unknown =>
        log.error(s"Requested non-liveblog: ${unknown.metadata.id}")
        Right(InternalServerError)
    }

    content
  }

  def shouldFilter(filterKeyEvents: Option[Boolean]): Boolean = {
    filterKeyEvents.getOrElse(false)
  }
}

object LiveBlogController {
  private def isSupportedTheme(blog: PageWithStoryPackage): Boolean = {
    blog.article.content.metadata.format.getOrElse(ContentFormat.defaultContentFormat).theme match {
      case NewsPillar      => true
      case CulturePillar   => true
      case LifestylePillar => true
      case SportPillar     => false
      case _               => false
    }
  }

  def isDeadBlog(blog: PageWithStoryPackage): Boolean = !blog.article.fields.isLive

  def isNotRecent(blog: PageWithStoryPackage): Boolean = {
    val twoDaysAgo = new DateTime(DateTimeZone.UTC).minusDays(2)
    blog.article.fields.lastModified.isBefore(twoDaysAgo)
  }

  def checkIfSupported(blog: PageWithStoryPackage): Boolean = {
    isDeadBlog(blog) && isSupportedTheme(blog) && isNotRecent(blog)
  }
}
