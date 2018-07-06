package controllers

import com.gu.contentapi.client.model.v1.{ItemResponse, Content => ApiContent}
import common.`package`.{convertApiExceptions => _, renderFormat => _, _}
import common._
import conf.switches.Switches
import contentapi.ContentApiClient
import model.Cached.WithoutRevalidationResult
import model.LiveBlogHelpers._
import model.ParseBlockId.{InvalidFormat, ParsedBlockId}
import model.liveblog.BodyBlock
import model.{ApplicationContext, Canonical, _}
import org.joda.time.DateTime
import pages.{ArticleEmailHtmlPage, LiveBlogHtmlPage, MinuteHtmlPage}
import play.api.libs.functional.syntax._
import play.api.libs.json._
import play.api.libs.ws.WSClient
import play.api.mvc._
import views.support.RenderOtherStatus

import scala.concurrent.Future
import common.RichRequestHeader
import services.LookerUpper


case class MinutePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

class LiveBlogController(contentApiClient: ContentApiClient, val controllerComponents: ControllerComponents, ws: WSClient)(implicit context: ApplicationContext) extends BaseController with RendersItemResponse with Logging with ImplicitControllerExecutionContext {

  val lookerUpper: LookerUpper = new LookerUpper(contentApiClient)

  // we support liveblogs and also articles so that minutes work
  private def isSupported(c: ApiContent) = c.isLiveBlog || c.isArticle
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = mapModel(path, Some(Canonical))(render(path, _))

  private def noAMP(renderPage: => Result)(implicit  request: RequestHeader): Result = {
    if (request.isAmp) NotFound
    else renderPage
  }

  def renderEmail(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      println("Rendering live blog email")
      mapModel(path, range = Some(ArticleBlocks)) {
        render(path, _)
      }
    }

  def renderArticle(path: String, page: Option[String] = None, format: Option[String] = None): Action[AnyContent] =

      Action.async { implicit request =>

        println("Rendering live blog")

        def renderWithRange(range: BlockRange) =
          mapModel(path, range = Some(range)) {
            render(path, _)
          }

        page.map(ParseBlockId.fromPageParam) match {
          case Some(ParsedBlockId(id)) => renderWithRange(PageWithBlock(id)) // we know the id of a block
          case Some(InvalidFormat) => Future.successful(Cached(10)(WithoutRevalidationResult(NotFound))) // page param there but couldn't extract a block id
          case None => println("rendering with canonical"); renderWithRange(Canonical) // no page param
        }
      }

  def renderJson(path: String, lastUpdate: Option[String], rendered: Option[Boolean], isLivePage: Option[Boolean]): Action[AnyContent] = {
    Action.async { implicit request =>

      println("Rendering live blog json")

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
        case None => if (rendered.contains(false)) mapModel(path, Some(Canonical)) { model => blockText(model, 6) } else renderWithRange(Canonical) // no page param
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

  private def render(path: String, page: PageWithStoryPackage)(implicit request: RequestHeader) = page match {

    case minute: MinutePage =>
      noAMP {
        val htmlResponse = () => {
          if (request.isEmail) ArticleEmailHtmlPage.html(minute)
          else MinuteHtmlPage.html(minute)
        }

        val jsonResponse = () => views.html.fragments.minuteBody(minute)
        renderFormat(htmlResponse, jsonResponse, minute, Switches.all)
      }
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
