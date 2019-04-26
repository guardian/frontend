package controllers

import com.gu.contentapi.client.model.v1.{ItemResponse, Content => ApiContent}
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

import scala.concurrent.Future

case class MinutePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

class LiveBlogController(contentApiClient: ContentApiClient, val controllerComponents: ControllerComponents, ws: WSClient)(implicit context: ApplicationContext) extends BaseController with RendersItemResponse with Logging with ImplicitControllerExecutionContext {

  val capiLookup: CAPILookup = new CAPILookup(contentApiClient)

  // we support liveblogs and also articles, so that minutes work
  private def isSupported(c: ApiContent) = c.isLiveBlog || c.isArticle
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = mapModel(path, Canonical)(render(path, _))

  def renderEmail(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      mapModel(path, ArticleBlocks) {
        render(path, _)
      }
    }

  def renderArticle(path: String, page: Option[String] = None, format: Option[String] = None): Action[AnyContent] =
      Action.async { implicit request =>
        def renderWithRange(range: BlockRange) =
          mapModel(path, range) {
            render(path, _)
          }
        page.map(ParseBlockId.fromPageParam) match {
          case Some(ParsedBlockId(id)) => renderWithRange(PageWithBlock(id)) // we know the id of a block
          case Some(InvalidFormat) => Future.successful(Cached(10)(WithoutRevalidationResult(NotFound))) // page param there but couldn't extract a block id
          case None => renderWithRange(Canonical) // no page param
        }
      }

  def renderJson(path: String, lastUpdate: Option[String], rendered: Option[Boolean], isLivePage: Option[Boolean]): Action[AnyContent] = {
    Action.async { implicit request =>
      val range = getRange(lastUpdate, rendered)
      mapModel(path, range) {
        case liveblog: LiveBlogPage if rendered.contains(false) => getJsonForFronts(liveblog)
        case liveblog: LiveBlogPage if request.isGuui => getGuuiJson(path, liveblog, range, isLivePage)
        case liveblog: LiveBlogPage => getJson(path, liveblog, range, isLivePage)
        case minute: MinutePage => render(path, minute)
        case _ => Future { Cached(600)(WithoutRevalidationResult(NotFound)) }
      }
    }
  }

  private def getRange(lastUpdate: Option[String], rendered: Option[Boolean]): BlockRange = {
    lastUpdate.map(ParseBlockId.fromBlockId) match {
      case Some(ParsedBlockId(id)) => SinceBlockId(id)
      case _ => Canonical
    }
  }

  private def getJsonForFronts(liveblog: LiveBlogPage)(implicit request: RequestHeader): Future[Result] = {
    Future {
      Cached(liveblog)(JsonComponent("blocks" -> model.LiveBlogHelpers.blockTextJson(liveblog, 6)))
    }
  }

  private def getJson(path: String, liveblog: PageWithStoryPackage, range: BlockRange, isLivePage: Option[Boolean])(implicit request: RequestHeader): Future[Result] = {
    range match {
      case SinceBlockId(lastBlockId) => renderNewerUpdatesJson(liveblog, SinceBlockId(lastBlockId), isLivePage)
      case _ => render(path, liveblog)
    }
  }

  private def getGuuiJson(path: String, liveblog: PageWithStoryPackage, range: BlockRange, isLivePage: Option[Boolean])(implicit request: RequestHeader): Future[Result] = {
    Future {
      Ok(DotcomponentsDataModel.toJsonString(DotcomponentsDataModel.fromLiveBlog()))
    }
  }

  private def renderNewerUpdatesJson(page: PageWithStoryPackage, lastUpdateBlockId: SinceBlockId, isLivePage: Option[Boolean])(implicit request: RequestHeader): Future[Result] = {
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

  private def renderMinute(path: String, minute: MinutePage)(implicit request: RequestHeader): Future[Result] = {
    Future {
      request.getRequestFormat match {
        case JsonFormat => common.renderJson (views.html.fragments.minuteBody(minute), minute)
        case EmailFormat => common.renderEmail (ArticleEmailHtmlPage.html(minute), minute)
        case HtmlFormat => common.renderHtml (MinuteHtmlPage.html(minute), minute)
        case AmpFormat => NotFound
      }
    }
  }

  private def renderLiveBlog(path: String, blog: LiveBlogPage)(implicit request: RequestHeader): Future[Result] = {
    Future {
      request.getRequestFormat match {
        case JsonFormat => common.renderJson( views.html.liveblog.liveBlogBody(blog), blog )
        case EmailFormat => common.renderEmail( LiveBlogHtmlPage.html(blog), blog )
        case HtmlFormat => common.renderHtml( LiveBlogHtmlPage.html(blog), blog )
        case AmpFormat => common.renderHtml( views.html.liveBlogAMP(blog), blog )
      }
    }
  }

  private def render(path: String, page: PageWithStoryPackage)(implicit request: RequestHeader): Future[Result] = page match {
    case minute: MinutePage => renderMinute(path, minute)
    case blog: LiveBlogPage => renderLiveBlog(path, blog)
  }


  private def mapModel(path: String, range: BlockRange)(render: PageWithStoryPackage => Future[Result])(implicit request: RequestHeader): Future[Result] = {
    capiLookup
      .lookup(path, Some(range))
      .map(responseToModelOrResult(range))
      .recover(convertApiExceptions)
      .flatMap {
        case Left(model) => render(model)
        case Right(other) => Future.successful(RenderOtherStatus(other))
      }
  }

  private def responseToModelOrResult(range: BlockRange)(response: ItemResponse)(implicit request: RequestHeader): Either[PageWithStoryPackage, Result] = {
    val supportedContent: Option[ContentType] = response.content.filter(isSupported).map(Content(_))
    val supportedContentResult: Either[ContentType, Result] = ModelOrResult(supportedContent, response)
    val content: Either[PageWithStoryPackage, Result] = supportedContentResult.left.flatMap {
      case minute: Article if minute.isTheMinute =>
        Left(MinutePage(minute, StoryPackages(minute.metadata.id, response)))
      case liveBlog: Article if liveBlog.isLiveBlog && request.isEmail =>
        Left(MinutePage(liveBlog, StoryPackages(liveBlog.metadata.id, response)))
      case liveBlog: Article if liveBlog.isLiveBlog =>
        createLiveBlogModel(liveBlog, response, range)
    }
    content
  }

}
