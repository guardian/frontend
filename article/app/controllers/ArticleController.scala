package controllers

import com.gu.contentapi.client.model.v1.{ItemResponse, Content => ApiContent}
import common._
import conf.switches.Switches
import contentapi.ContentApiClient
import model.ParseBlockId.{InvalidFormat, ParsedBlockId}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.{PageWithStoryPackage, _}
import LiveBlogHelpers._
import conf.Configuration
import model.liveblog._
import org.joda.time.DateTime
import pages.{ArticleEmailHtmlPage, ArticleHtmlPage, LiveBlogHtmlPage, MinuteHtmlPage}
import play.api.libs.functional.syntax._
import play.api.libs.json.{Json, _}
import play.api.libs.ws.WSClient
import play.api.mvc._
import play.twirl.api.Html
import views.support._

import scala.concurrent.duration._
import scala.concurrent.Future
import java.lang.System.currentTimeMillis

import metrics.TimingMetric
import services.{LocalRender, RemoteRender, RenderType, RenderingTierPicker}

case class ArticlePage(article: Article, related: RelatedContent) extends PageWithStoryPackage
case class MinutePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

class ArticleController(contentApiClient: ContentApiClient, val controllerComponents: ControllerComponents, ws: WSClient)(implicit context: ApplicationContext) extends BaseController
    with RendersItemResponse with Logging with ImplicitControllerExecutionContext {

  private def isSupported(c: ApiContent) = c.isArticle || c.isLiveBlog || c.isSudoku
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = mapModel(path, Some(Canonical))(render(path, _))


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

  private def render(path: String, page: PageWithStoryPackage)(implicit request: RequestHeader) = page match {
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

      RenderingTierPicker.getRenderTierFor(page) match {
        case RemoteRender => log.logger.info(s"Remotely renderable article $path")
        case _ =>
      }

      val htmlResponse = () => {
        if (request.isEmail) ArticleEmailHtmlPage.html(article)
        else if (request.isAmp) views.html.articleAMP(article)
        else ArticleHtmlPage.html(article)
      }

      val contentFieldsJson = if (request.isGuuiJson) List("contentFields" -> Json.toJson(ContentFields(article.article))) else List()

      val jsonResponse = () => List(("html", views.html.fragments.articleBody(article))) ++ contentFieldsJson
      renderFormat(htmlResponse, jsonResponse, article)
  }

  def renderLiveBlog(path: String, page: Option[String] = None, format: Option[String] = None): Action[AnyContent] =
    if (format.contains("email"))
      renderArticle(path)
    else
      Action.async { implicit request =>

        def renderWithRange(range: BlockRange) =
          mapModel(path, range = Some(range), asArticle=false) {// temporarily only ask for blocks too for things we know are new live blogs until until the migration is done and we can always use blocks
            render(path, _)
          }

        page.map(ParseBlockId.fromPageParam) match {
          case Some(ParsedBlockId(id)) => renderWithRange(PageWithBlock(id)) // we know the id of a block
          case Some(InvalidFormat) => Future.successful(Cached(10)(WithoutRevalidationResult(NotFound))) // page param there but couldn't extract a block id
          case None => renderWithRange(Canonical) // no page param
        }
      }

  def renderLiveBlogJson(path: String, lastUpdate: Option[String], rendered: Option[Boolean], isLivePage: Option[Boolean]): Action[AnyContent] = {
    Action.async { implicit request =>

      def renderWithRange(range: BlockRange) =
        mapModel(path, Some(range), asArticle=false) { model =>
          range match {
            case SinceBlockId(lastBlockId) => renderNewerUpdates(model, SinceBlockId(lastBlockId), isLivePage)
            case _ => render(path, model)
          }
        }

      lastUpdate.map(ParseBlockId.fromBlockId) match {
        case Some(ParsedBlockId(id)) => renderWithRange(SinceBlockId(id))
        case Some(InvalidFormat) => Future.successful(Cached(10)(WithoutRevalidationResult(NotFound))) // page param there but couldn't extract a block id
        case None => if (rendered.contains(false)) mapModel(path, Some(Canonical), asArticle=false) { model => blockText(model, 6) } else renderWithRange(Canonical) // no page param
      }
    }
  }

  def renderJson(path: String): Action[AnyContent] = {
    Action.async { implicit request =>
      mapModel(path, if (request.isGuuiJson) Some(ArticleBlocks) else None) {
        render(path, _)
      }
    }
  }

  def remoteRenderArticle(payload: String): Future[String] = ws.url(Configuration.rendering.renderingEndpoint)
    .withRequestTimeout(2000.millis)
    .addHttpHeaders("Content-Type" -> "application/json")
    .post(payload)
    .map((response) =>
      response.body
    )

  def remoteRender(path: String, model: PageWithStoryPackage)(implicit request: RequestHeader): Future[Result] = model match {

    case article : ArticlePage =>
      val contentFieldsJson = if (request.isGuui) List("contentFields" -> Json.toJson(ContentFields(article.article))) else List()
      val jsonResponse = () => List(("html", views.html.fragments.articleBody(article))) ++ contentFieldsJson
      val jsonPayload = JsonComponent.jsonFor(model, jsonResponse():_*)

      remoteRenderArticle(jsonPayload).map(s => {
        Cached(article){ RevalidatableResult.Ok(Html(s)) }
      })

    case _ => throw new Exception("Remote render not supported for this content type")

  }

  def timedFuture[T](future: Future[T], metric: TimingMetric): Future[T] = {
      val start = currentTimeMillis
      future.onComplete(_ => metric.recordDuration(currentTimeMillis - start))
      future
  }

  // for the GUUI demo. Same as mapModel except the render method should return a  Future[Result] instead of Result
  def mapModelGUUI(path: String, range: Option[BlockRange] = None, asArticle: Boolean=true)(render: PageWithStoryPackage => Future[Result])(implicit request: RequestHeader): Future[Result] = {

    lookup(path, range).map((itemResp: ItemResponse) => responseToModelOrResult(range, asArticle)(itemResp)).recover(convertApiExceptions).flatMap {
      case Left(model) => render(model)
      case Right(other) => Future.successful(RenderOtherStatus(other))
    }

  }

  def renderArticle(path: String): Action[AnyContent] = {

    Action.async { implicit request =>

      if(request.isGuui){

        timedFuture(
          mapModelGUUI(path, Some(ArticleBlocks)){
            remoteRender(path, _)
          },
          ArticleRenderingMetrics.RemoteRenderingMetric
        )

      } else {

        timedFuture(
          mapModel(path, Some(ArticleBlocks)) {
            render(path, _)
          },
          ArticleRenderingMetrics.LocalRenderingMetric
        )

      }

    }
  }

  // range: None means the url didn't include /live/, Some(...) means it did.  Canonical just means no url parameter
  // if we switch to using blocks instead of body for articles, then it no longer needs to be Optional
  def mapModel(path: String, range: Option[BlockRange] = None, asArticle: Boolean = true)(render: PageWithStoryPackage => Result)(implicit request: RequestHeader): Future[Result] = {
    lookup(path, range) map responseToModelOrResult(range, asArticle) recover convertApiExceptions map {
      case Left(model) => render(model)
      case Right(other) => RenderOtherStatus(other)
    }
  }

  private def lookup(path: String, range: Option[BlockRange])(implicit request: RequestHeader): Future[ItemResponse] = {
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

  /**
   * convert a response into something we can render, and return it
   * optionally, throw a response if we know it's not right to send the content
    *
    * @param response
   * @return Either[PageWithStoryPackage, Result]
   */
  def responseToModelOrResult(range: Option[BlockRange], asArticle:Boolean)(response: ItemResponse)(implicit request: RequestHeader): Either[PageWithStoryPackage, Result] = {

    val supportedContent = response.content.filter(isSupported).map(Content(_))
    val supportedContentResult = ModelOrResult(supportedContent, response)
    val content: Either[PageWithStoryPackage, Result] = supportedContentResult.left.flatMap {
      case minute: Article if minute.isTheMinute =>
        Left(MinutePage(minute, StoryPackages(minute, response)))
        // Enable an email format for 'Minute' content (which are actually composed as a LiveBlog), without changing the non-email display of the page
      case liveBlog: Article if liveBlog.isLiveBlog && request.isEmail =>
        Left(MinutePage(liveBlog, StoryPackages(liveBlog, response)))
      case liveBlog: Article if liveBlog.isLiveBlog && !asArticle =>
        range.map {
          createLiveBlogModel(liveBlog, response, _)
        }.getOrElse(Right(NotFound))
      case article: Article =>
        Left(ArticlePage(article, StoryPackages(article, response)))
    }

    content

  }


}


