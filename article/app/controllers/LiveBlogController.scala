package controllers

import com.gu.contentapi.client.model.v1.{Block, Blocks, ItemResponse, Content => ApiContent}
import common.`package`.{convertApiExceptions => _, renderFormat => _}
import common._
import contentapi.ContentApiClient
import implicits.{AmpFormat, AppsFormat, HtmlFormat}
import model.Cached.WithoutRevalidationResult
import model.LiveBlogHelpers._
import model.ParseBlockId.{InvalidFormat, ParsedBlockId}
import model.dotcomrendering.{DotcomRenderingDataModel, PageType}
import model.liveblog.BodyBlock
import model.liveblog.BodyBlock.{KeyEvent, SummaryEvent}
import model._
import model.meta.BlocksOn
import pages.{ArticleEmailHtmlPage, LiveBlogHtmlPage, MinuteHtmlPage}
import play.api.libs.ws.WSClient
import play.api.mvc._
import play.twirl.api.Html
import renderers.DotcomRenderingService
import services.{CAPILookup, NewsletterService}
import utils.DotcomponentsLogger
import views.support.RenderOtherStatus

import scala.concurrent.Future

case class MinutePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

class LiveBlogController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    ws: WSClient,
    remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService(),
    newsletterService: NewsletterService,
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
        _.page match {
          case minute: MinutePage =>
            Future.successful(common.renderEmail(ArticleEmailHtmlPage.html(minute), minute))
          case blog: LiveBlogPage => Future.successful(common.renderEmail(LiveBlogHtmlPage.html(blog), blog))
          case _                  => Future.successful(NotFound)
        }
      }
    }
  }

  def renderArticle(
      path: String,
      page: Option[String] = None,
      filterKeyEvents: Option[Boolean],
  ): Action[AnyContent] = {
    Action.async { implicit request =>
      val filter = shouldFilter(filterKeyEvents)

      page.map(ParseBlockId.fromPageParam) match {
        case Some(ParsedBlockId(id)) =>
          renderWithRange(
            path,
            PageWithBlock(id),
            filter,
          ) // we know the id of a block
        case Some(InvalidFormat) =>
          Future.successful(
            Cached(10)(WithoutRevalidationResult(NotFound)),
          ) // page param there but couldn't extract a block id
        case None => {
          renderWithRange(
            path,
            CanonicalLiveBlog,
            filter,
          ) // no page param
        }
      }
    }
  }

  def renderJson(
      path: String,
      page: Option[String],
      lastUpdate: Option[String],
      rendered: Option[Boolean],
      isLivePage: Option[Boolean],
      filterKeyEvents: Option[Boolean],
  ): Action[AnyContent] = {
    Action.async { implicit request: Request[AnyContent] =>
      val filter = shouldFilter(filterKeyEvents)
      val range = getRange(lastUpdate, page)

      mapModel(path, range, filter) { pageBlocks =>
        pageBlocks.page match {
          case blog: LiveBlogPage if rendered.contains(false) => getJsonForFronts(blog)

          /** When DCR requests new blocks from the client, it will add a `lastUpdate` parameter. If no such parameter
            * is present, we should return a JSON representation of the whole payload that would be sent to DCR when
            * initially server side rendering the LiveBlog page.
            */
          case blog: LiveBlogPage if request.forceDCR && lastUpdate.isEmpty =>
            Future.successful(renderDCRJson(pageBlocks.copy(page = blog), filter))
          case blog: LiveBlogPage =>
            getJson(
              blog,
              range,
              isLivePage,
              filter,
              pageBlocks.blocks.requestedBodyBlocks.getOrElse(Map.empty).map(entry => (entry._1, entry._2.toSeq)),
            )
          case minute: MinutePage =>
            Future.successful(common.renderJson(views.html.fragments.minuteBody(minute), minute))
          case _ =>
            Future {
              Cached(600)(WithoutRevalidationResult(NotFound))
            }
        }
      }
    }
  }

  private[this] def renderWithRange(
      path: String,
      range: BlockRange,
      filterKeyEvents: Boolean,
  )(implicit
      request: RequestHeader,
  ): Future[Result] = {
    mapModel(path, range, filterKeyEvents) { pageBlocks =>
      {
        val page = pageBlocks.page
        val isAmpSupported = page.article.content.shouldAmplify
        val pageType: PageType = PageType(page, request, context)
        (page, request.getRequestFormat) match {
          case (minute: MinutePage, HtmlFormat) =>
            Future.successful(common.renderHtml(MinuteHtmlPage.html(minute), minute))
          case (blog: LiveBlogPage, HtmlFormat) =>
            val dcrCouldRender = true
            val theme = blog.article.content.metadata.format.getOrElse(ContentFormat.defaultContentFormat).theme
            val design = blog.article.content.metadata.format.getOrElse(ContentFormat.defaultContentFormat).design
            val display = blog.article.content.metadata.format.getOrElse(ContentFormat.defaultContentFormat).display
            val isDeadBlog = !blog.article.fields.isLive
            val properties =
              Map(
                "participatingInTest" -> "false",
                "dcrCouldRender" -> dcrCouldRender.toString,
                "theme" -> theme.toString,
                "design" -> design.toString,
                "display" -> display.toString,
                "isDead" -> isDeadBlog.toString,
                "isLiveBlog" -> "true",
              )
            val remoteRendering = !request.forceDCROff

            if (remoteRendering) {
              DotcomponentsLogger.logger
                .logRequest(s"liveblog executing in dotcomponents", properties, page.article)
              val pageType: PageType = PageType(blog, request, context)
              remoteRenderer.getArticle(
                ws,
                pageBlocks.copy(page = blog),
                pageType,
                newsletter = None,
                filterKeyEvents,
                request.forceLive,
              )
            } else {
              DotcomponentsLogger.logger.logRequest(s"liveblog executing in web", properties, page.article)
              Future.successful(common.renderHtml(LiveBlogHtmlPage.html(blog), blog))
            }
          case (blog: LiveBlogPage, AmpFormat) if isAmpSupported =>
            remoteRenderer.getAMPArticle(ws, pageBlocks, pageType, newsletter = None, filterKeyEvents)
          case (blog: LiveBlogPage, AmpFormat) =>
            Future.successful(common.renderHtml(LiveBlogHtmlPage.html(blog), blog))
          case (blog: LiveBlogPage, AppsFormat) =>
            remoteRenderer.getAppsArticle(
              ws,
              pageBlocks,
              pageType,
              newsletter = None,
              filterKeyEvents,
              request.forceLive,
            )
          case _ => Future.successful(NotFound)
        }
      }

    }
  }

  private[this] def getRange(
      lastUpdate: Option[String],
      page: Option[String],
  ): BlockRange = {
    (lastUpdate.map(ParseBlockId.fromBlockId), page.map(ParseBlockId.fromPageParam)) match {
      case (Some(ParsedBlockId(id)), _) => SinceBlockId(id)
      case (_, Some(ParsedBlockId(id))) => PageWithBlock(id)
      case _                            => CanonicalLiveBlog
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
      requestedBodyBlocks: scala.collection.Map[String, Seq[Block]] = Map.empty,
  )(implicit request: RequestHeader): Future[Result] = {
    val remoteRender = !request.forceDCROff

    range match {
      case SinceBlockId(lastBlockId) =>
        renderNewerUpdatesJson(
          liveblog,
          SinceBlockId(lastBlockId),
          isLivePage,
          filterKeyEvents,
          remoteRender,
          requestedBodyBlocks,
        )
      case _ => Future.successful(common.renderJson(views.html.liveblog.liveBlogBody(liveblog), liveblog))
    }
  }

  private[this] def getNewBlocks(
      page: PageWithStoryPackage,
      lastUpdateBlockId: SinceBlockId,
      filterKeyEvents: Boolean,
  ): (Option[BodyBlock], Seq[BodyBlock]) = {
    val requestedBlocks = page.article.fields.blocks.toSeq.flatMap {
      _.requestedBodyBlocks.getOrElse(lastUpdateBlockId.around, Seq())
    }

    val latestBlocks = requestedBlocks.takeWhile { block =>
      block.id != lastUpdateBlockId.lastUpdate
    }

    val filteredBlocks = if (filterKeyEvents) {
      latestBlocks.filter(block => block.eventType == KeyEvent || block.eventType == SummaryEvent)
    } else latestBlocks

    // the last block is picked from the unfiltered list
    (latestBlocks.headOption, filteredBlocks)
  }

  private[this] def getNewBlocks(
      requestedBodyBlocks: scala.collection.Map[String, Seq[Block]],
      lastUpdateBlockId: SinceBlockId,
      filterKeyEvents: Boolean,
  ): Seq[Block] = {
    val blocksAround = requestedBodyBlocks.getOrElse(lastUpdateBlockId.around, Seq.empty).takeWhile { block =>
      block.id != lastUpdateBlockId.lastUpdate
    }

    if (filterKeyEvents) {
      blocksAround.filter(block =>
        block.attributes.keyEvent.getOrElse(false) || block.attributes.summary.getOrElse(false),
      )
    } else blocksAround
  }

  private def getDCRBlocksHTML(page: LiveBlogPage, blocks: Seq[Block])(implicit
      request: RequestHeader,
  ): Future[Html] = {
    remoteRenderer.getBlocks(ws, page, blocks) map { result =>
      new Html(result)
    }
  }

  private def getAppsBlocksHTML(page: LiveBlogPage, blocks: Seq[Block])(implicit
      request: RequestHeader,
  ): Future[Html] = {
    remoteRenderer.getAppsBlocks(ws, page, blocks) map { result =>
      new Html(result)
    }
  }

  private[this] def renderNewerUpdatesJson(
      page: LiveBlogPage,
      lastUpdateBlockId: SinceBlockId,
      isLivePage: Option[Boolean],
      filterKeyEvents: Boolean,
      remoteRender: Boolean,
      requestedBodyBlocks: scala.collection.Map[String, Seq[Block]],
  )(implicit request: RequestHeader): Future[Result] = {
    val (newestBlock, newBlocks) = getNewBlocks(page, lastUpdateBlockId, filterKeyEvents)
    val newCapiBlocks = getNewBlocks(requestedBodyBlocks, lastUpdateBlockId, filterKeyEvents)

    val timelineHtml = views.html.liveblog.keyEvents(
      "",
      model.KeyEventData(newBlocks, Edition(request).timezone),
      filterKeyEvents,
    )

    for {
      blocksHtml <-
        if (remoteRender && request.getRequestFormat == AppsFormat) {
          getAppsBlocksHTML(page, newCapiBlocks)
        } else if (remoteRender) {
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
      val mostRecent = newestBlock.map { block =>
        "mostRecentBlockId" -> s"block-${block.id}"
      }

      Cached(page)(JsonComponent(allPagesJson ++ livePageJson ++ mostRecent: _*))
    }
  }

  /** Returns a JSON representation of the payload that's sent to DCR when rendering the whole LiveBlog page.
    */
  private[this] def renderDCRJson(
      pageBlocks: BlocksOn[LiveBlogPage],
      filterKeyEvents: Boolean,
  )(implicit request: RequestHeader): Result = {
    val blog = pageBlocks.page
    val pageType: PageType = PageType(blog, request, context)
    val newsletter = newsletterService.getNewsletterForLiveBlog(blog)

    val model =
      DotcomRenderingDataModel.forLiveblog(
        pageBlocks,
        request,
        pageType,
        filterKeyEvents,
        request.forceLive,
        newsletter,
      )
    val json = DotcomRenderingDataModel.toJson(model)
    common.renderJson(json, blog).as("application/json")
  }

  private[this] def mapModel(
      path: String,
      range: BlockRange,
      filterKeyEvents: Boolean = false,
  )(
      render: BlocksOn[PageWithStoryPackage] => Future[Result],
  )(implicit request: RequestHeader): Future[Result] = {
    capiLookup
      .lookup(path, Some(range))
      .map(responseToModelOrResult(range, filterKeyEvents))
      .recover(convertApiExceptions)
      .flatMap {
        case Right(pageBlocks) => render(pageBlocks)
        case Left(other)       => Future.successful(RenderOtherStatus(other))
      }
  }

  private[this] def responseToModelOrResult(
      range: BlockRange,
      filterKeyEvents: Boolean,
  )(response: ItemResponse)(implicit request: RequestHeader): Either[Result, BlocksOn[PageWithStoryPackage]] = {
    val supportedContent: Option[ContentType] = response.content.filter(isSupported).map(Content(_))
    val supportedContentResult: Either[Result, ContentType] = ModelOrResult(supportedContent, response)
    val blocks = response.content.flatMap(_.blocks).getOrElse(Blocks())

    val content = supportedContentResult.flatMap {
      case minute: Article if minute.isTheMinute =>
        Right(MinutePage(minute, StoryPackages(minute.metadata.id, response)))
      case liveBlog: Article if liveBlog.isLiveBlog && request.isEmail =>
        Right(MinutePage(liveBlog, StoryPackages(liveBlog.metadata.id, response)))
      case liveBlog: Article if liveBlog.isLiveBlog =>
        createLiveBlogModel(
          liveBlog,
          response,
          range,
          filterKeyEvents,
        )
      case nonLiveBlogArticle: Article =>
        /** If `isLiveBlog` is false, it must be because the article has no blocks, or lacks the `tone/minutebyminute`
          * tag, or both. Logging these values will help us to identify which is causing the issue.
          */
        val hasBlocks = nonLiveBlogArticle.fields.blocks.nonEmpty;
        val hasMinuteByMinuteTag = nonLiveBlogArticle.tags.isLiveBlog;
        logErrorWithRequestId(
          s"Requested non-liveblog article as liveblog: ${nonLiveBlogArticle.metadata.id}: { hasBlocks: ${hasBlocks}, hasMinuteByMinuteTag: ${hasMinuteByMinuteTag} }",
        )
        Left(InternalServerError)
      case unknown =>
        logErrorWithRequestId(s"Requested non-liveblog: ${unknown.metadata.id}")
        Left(InternalServerError)
    }

    content.map(BlocksOn(_, blocks))
  }

  def shouldFilter(filterKeyEvents: Option[Boolean]): Boolean = {
    filterKeyEvents.getOrElse(false)
  }
}
