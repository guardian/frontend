package controllers

import com.gu.contentapi.client.model.v1.{ItemResponse, Content => ApiContent}
import common.`package`.{convertApiExceptions => _, renderFormat => _}
import common.{JsonComponent, RichRequestHeader, _}
import conf.switches.Switches
import contentapi.ContentApiClient
import model.Cached.WithoutRevalidationResult
import model.LiveBlogHelpers._
import model.ParseBlockId.{InvalidFormat, ParsedBlockId}
import model.{ApplicationContext, Canonical, _}
import pages.{ArticleEmailHtmlPage, LiveBlogHtmlPage, MinuteHtmlPage}
import play.api.libs.ws.WSClient
import play.api.mvc._
import services.LookerUpper
import views.support.RenderOtherStatus

import scala.concurrent.Future

case class MinutePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

class LiveBlogController(contentApiClient: ContentApiClient, val controllerComponents: ControllerComponents, ws: WSClient)(implicit context: ApplicationContext) extends BaseController with RendersItemResponse with Logging with ImplicitControllerExecutionContext {

  val lookerUpper: LookerUpper = new LookerUpper(contentApiClient)

  // we support liveblogs and also articles, so that minutes work
  private def isSupported(c: ApiContent) = c.isLiveBlog || c.isArticle
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = mapModel(path, Some(Canonical))(render(path, _))

  def renderEmail(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      mapModel(path, range = Some(ArticleBlocks)) {
        render(path, _)
      }
    }

  def renderArticle(path: String, page: Option[String] = None, format: Option[String] = None): Action[AnyContent] =
      Action.async { implicit request =>
        def renderWithRange(range: BlockRange) =
          mapModel(path, range = Some(range)) {
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
        case None => if (rendered.contains(false))
          mapModel(path, Some(Canonical)) {
            case liveblog: LiveBlogPage => Cached(liveblog)(JsonComponent("blocks" -> model.LiveBlogHelpers.blockTextJson(liveblog, 6)))
            case _ => Cached(600)(WithoutRevalidationResult(NotFound))
          } else renderWithRange(Canonical) // no page param
      }
    }
  }

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

  private def render(path: String, page: PageWithStoryPackage)(implicit request: RequestHeader) = page match {

    case minute: MinutePage if request.isAmp =>
      NotFound
    case minute: MinutePage =>
      val htmlResponse = () => {
        if (request.isEmail) ArticleEmailHtmlPage.html(minute)
        else MinuteHtmlPage.html(minute)
      }
      val jsonResponse = () => views.html.fragments.minuteBody(minute)
      renderFormat(htmlResponse, jsonResponse, minute, Switches.all)
    case blog: LiveBlogPage =>
      val htmlResponse = () => {
        if (request.isAmp) views.html.liveBlogAMP(blog)
        else LiveBlogHtmlPage.html(blog)
      }
      val jsonResponse = () => views.html.liveblog.liveBlogBody(blog)
      renderFormat(htmlResponse, jsonResponse, blog, Switches.all)

  }

  private def mapModel(path: String, range: Option[BlockRange] = None)(render: PageWithStoryPackage => Result)(implicit request: RequestHeader): Future[Result] = {
    lookerUpper.lookup(path, range) map responseToModelOrResult(range) recover convertApiExceptions map {
      case Left(model) => render(model)
      case Right(other) => RenderOtherStatus(other)
    }
  }

  private def responseToModelOrResult(range: Option[BlockRange])(response: ItemResponse)(implicit request: RequestHeader): Either[PageWithStoryPackage, Result] = {

    val supportedContent = response.content.filter(isSupported).map(Content(_))
    val supportedContentResult = ModelOrResult(supportedContent, response)

    val content: Either[PageWithStoryPackage, Result] = supportedContentResult.left.flatMap {
      case minute: Article if minute.isTheMinute =>
        Left(MinutePage(minute, StoryPackages(minute, response)))
      case liveBlog: Article if liveBlog.isLiveBlog && request.isEmail =>
        Left(MinutePage(liveBlog, StoryPackages(liveBlog, response)))
      case liveBlog: Article if liveBlog.isLiveBlog =>
        range.map {
          createLiveBlogModel(liveBlog, response, _)
        }.getOrElse(Right(NotFound))
    }

    content

  }

}
