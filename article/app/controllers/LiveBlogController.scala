package controllers

import com.gu.contentapi.client.model.v1.{Block, Blocks, ItemResponse, Content => ApiContent}
import common.`package`.{convertApiExceptions => _, renderFormat => _}
import common.{JsonComponent, RichRequestHeader, _}
import contentapi.ContentApiClient
import implicits.{AmpFormat, HtmlFormat}
import model.Cached.WithoutRevalidationResult
import model.LiveBlogHelpers._
import model.ParseBlockId.{InvalidFormat, ParsedBlockId}
import model.dotcomrendering.{DotcomRenderingDataModel, PageType}
import model.liveblog.BodyBlock
import model.liveblog.BodyBlock.{KeyEvent, SummaryEvent}
import model.{ApplicationContext, CanonicalLiveBlog, _}
import pages.{ArticleEmailHtmlPage, LiveBlogHtmlPage, MinuteHtmlPage}
import play.api.libs.ws.WSClient
import play.api.mvc._
import play.twirl.api.Html
import renderers.DotcomRenderingService
import services.CAPILookup
import services.dotcomponents.DotcomponentsLogger
import topmentions.TopMentionsService
import views.support.RenderOtherStatus
import scala.concurrent.Future

case class MinutePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

class LiveBlogController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    ws: WSClient,
    remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService(),
    topMentionsService: TopMentionsService,
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
      mapModel(path, ArticleBlocks, topMentions = None) {
        case (minute: MinutePage, _) =>
          Future.successful(common.renderEmail(ArticleEmailHtmlPage.html(minute), minute))
        case (blog: LiveBlogPage, _) => Future.successful(common.renderEmail(LiveBlogHtmlPage.html(blog), blog))
        case _                       => Future.successful(NotFound)
      }
    }
  }

  def renderArticle(
      path: String,
      page: Option[String] = None,
      filterKeyEvents: Option[Boolean],
      topics: Option[String],
  ): Action[AnyContent] = {
    Action.async { implicit request =>
      val filter = shouldFilter(filterKeyEvents)
      val topMentions = if (filter) None else getTopMentions(path, topics)
      val availableTopics = topMentionsService.getTopics(path)

      page.map(ParseBlockId.fromPageParam) match {
        case Some(ParsedBlockId(id)) =>
          renderWithRange(
            path,
            PageWithBlock(id),
            filter,
            topMentions,
            availableTopics,
            selectedTopics = topics,
          ) // we know the id of a block
        case Some(InvalidFormat) =>
          Future.successful(
            Cached(10)(WithoutRevalidationResult(NotFound)),
          ) // page param there but couldn't extract a block id
        case None => {
          topMentions match {
            case Some(value) =>
              renderWithRange(
                path,
                TopicsLiveBlog,
                filter,
                Some(value),
                availableTopics,
                selectedTopics = topics,
              ) // no page param
            case None =>
              renderWithRange(
                path,
                CanonicalLiveBlog,
                filter,
                None,
                availableTopics,
                selectedTopics = topics,
              ) // no page param
          }
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
      topics: Option[String],
  ): Action[AnyContent] = {
    Action.async { implicit request: Request[AnyContent] =>
      val filter = shouldFilter(filterKeyEvents)
      val topMentionResult = getTopMentions(path, topics)
      val range = getRange(lastUpdate, page, topMentionResult)
      val availableTopics = topMentionsService.getTopics(path)

      mapModel(path, range, filter, topMentions) {
        case (blog: LiveBlogPage, _) if rendered.contains(false) => getJsonForFronts(blog)
        case (blog: LiveBlogPage, blocks) if request.forceDCR && lastUpdate.isEmpty =>
          Future.successful(renderGuuiJson(blog, blocks, filter, availableTopics, selectedTopics = topics))
        case (blog: LiveBlogPage, blocks) =>
          getJson(blog, range, isLivePage, filter, blocks.requestedBodyBlocks.getOrElse(Map.empty), topMentions)
        case (minute: MinutePage, _) =>
          Future.successful(common.renderJson(views.html.fragments.minuteBody(minute), minute))
        case _ =>
          Future {
            Cached(600)(WithoutRevalidationResult(NotFound))
          }
      }
    }
  }

  private[this] def renderWithRange(
      path: String,
      range: BlockRange,
      filterKeyEvents: Boolean,
      topMentions: Option[TopMentions],
      availableTopics: Option[Seq[TopicWithCount]],
      selectedTopics: Option[String],
  )(implicit
      request: RequestHeader,
  ): Future[Result] = {
    mapModel(path, range, filterKeyEvents, topMentions) { (page, blocks) =>
      {
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
                .logRequest(s"liveblog executing in dotcomponents", properties, page)
              val pageType: PageType = PageType(blog, request, context)
              remoteRenderer.getArticle(
                ws,
                blog,
                blocks,
                pageType,
                filterKeyEvents,
                request.forceLive,
                availableTopics,
                selectedTopics,
              )
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

  private[this] def getRange(
      lastUpdate: Option[String],
      page: Option[String],
      topMentions: Option[TopMentions],
  ): BlockRange = {
    (lastUpdate.map(ParseBlockId.fromBlockId), page.map(ParseBlockId.fromPageParam), topMentions) match {
      case (Some(ParsedBlockId(id)), _, _) => SinceBlockId(id)
      case (_, Some(ParsedBlockId(id)), _) => PageWithBlock(id)
      case (_, _, Some(_))                 => TopicsLiveBlog
      case _                               => CanonicalLiveBlog
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
      topMentions: Option[TopMentions],
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
          topMentions,
        )
      case _ => Future.successful(common.renderJson(views.html.liveblog.liveBlogBody(liveblog), liveblog))
    }
  }

  private[this] def getNewBlocks(
      page: PageWithStoryPackage,
      lastUpdateBlockId: SinceBlockId,
      filterKeyEvents: Boolean,
      topMentions: Option[TopMentions],
  ): Seq[BodyBlock] = {
    val requestedBlocks = page.article.fields.blocks.toSeq.flatMap {
      _.requestedBodyBlocks.getOrElse(lastUpdateBlockId.around, Seq())
    }

    val latestBlocks = requestedBlocks.takeWhile { block =>
      block.id != lastUpdateBlockId.lastUpdate
    }

    if (filterKeyEvents) {
      latestBlocks.filter(block => block.eventType == KeyEvent || block.eventType == SummaryEvent)
    } else if (topMentions.isDefined) {
      latestBlocks.filter(block => topMentions.get.blocks.contains(block.id))
    } else latestBlocks

  }

  private[this] def getNewBlocks(
      requestedBodyBlocks: scala.collection.Map[String, Seq[Block]],
      lastUpdateBlockId: SinceBlockId,
      filterKeyEvents: Boolean,
      topMentions: Option[TopMentions],
  ): Seq[Block] = {
    val blocksAround = requestedBodyBlocks.getOrElse(lastUpdateBlockId.around, Seq.empty).takeWhile { block =>
      block.id != lastUpdateBlockId.lastUpdate
    }

    if (filterKeyEvents) {
      blocksAround.filter(block =>
        block.attributes.keyEvent.getOrElse(false) || block.attributes.summary.getOrElse(false),
      )
    } else if (topMentions.isDefined) {
      blocksAround.filter(block => topMentions.get.blocks.contains(block.id))
    } else blocksAround
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
      requestedBodyBlocks: scala.collection.Map[String, Seq[Block]],
      topMentions: Option[TopMentions],
  )(implicit request: RequestHeader): Future[Result] = {
    val newBlocks = getNewBlocks(page, lastUpdateBlockId, filterKeyEvents, topMentions)
    val newCapiBlocks = getNewBlocks(requestedBodyBlocks, lastUpdateBlockId, filterKeyEvents, topMentions)

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
      availableTopics: Option[Seq[TopicWithCount]],
      selectedTopics: Option[String],
  )(implicit request: RequestHeader): Result = {
    val pageType: PageType = PageType(blog, request, context)
    val model =
      DotcomRenderingDataModel.forLiveblog(
        blog,
        blocks,
        request,
        pageType,
        filterKeyEvents,
        request.forceLive,
        availableTopics,
        selectedTopics,
      )
    val json = DotcomRenderingDataModel.toJson(model)
    common.renderJson(json, blog).as("application/json")
  }

  private[this] def mapModel(
      path: String,
      range: BlockRange,
      filterKeyEvents: Boolean = false,
      topMentions: Option[TopMentions],
  )(
      render: (PageWithStoryPackage, Blocks) => Future[Result],
  )(implicit request: RequestHeader): Future[Result] = {
    capiLookup
      .lookup(path, Some(range))
      .map(responseToModelOrResult(range, filterKeyEvents, topMentions))
      .recover(convertApiExceptions)
      .flatMap {
        case Left((model, blocks)) => render(model, blocks)
        case Right(other)          => Future.successful(RenderOtherStatus(other))
      }
  }

  private[this] def responseToModelOrResult(
      range: BlockRange,
      filterKeyEvents: Boolean,
      topMentions: Option[TopMentions],
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
          topMentions,
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

  def getTopMentions(blogId: String, selectedTopics: Option[String]) = {
    val topMentions = for {
      topMentionTopic <- TopMentionsTopic.fromString(selectedTopics)
      topMentions <- topMentionsService.getTopMentionsByTopic(blogId, topMentionTopic)
    } yield topMentions

    topMentions match {
      case Some(_) => log.info(s"top mention result was successfully retrieved for ${selectedTopics.get}")
      case None =>
        if (selectedTopics.isDefined) log.warn(s"top mention result couldn't be retrieved for ${selectedTopics.get}")
    }

    topMentions
  }
}
