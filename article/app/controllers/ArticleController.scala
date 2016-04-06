package controllers

import _root_.liveblog.LiveBlogPageModel
import com.gu.contentapi.client.model.ItemResponse
import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import common._
import conf.LiveContentApi.getResponse
import conf._
import conf.switches.Switches
import model._
import model.liveblog.{BodyBlock, KeyEventData}
import org.joda.time.DateTime
import play.api.libs.functional.syntax._
import play.api.mvc._
import play.api.libs.json.{Json, _}
import views.support._

import scala.concurrent.Future
import scala.util.parsing.combinator.RegexParsers

trait PageWithStoryPackage extends ContentPage {
  def article: Article
  def related: RelatedContent
  override lazy val item = article
}

case class ArticlePage(article: Article, related: RelatedContent) extends PageWithStoryPackage
case class LiveBlogPage(article: Article, related: RelatedContent) extends PageWithStoryPackage
case class MinutePage(article: Article, related: RelatedContent) extends PageWithStoryPackage

object ArticleController extends Controller with RendersItemResponse with Logging with ExecutionContexts {

  private def isSupported(c: ApiContent) = c.isArticle || c.isLiveBlog || c.isSudoku
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = mapModel(path, blocks = true)(render(path, _, None))


  private def renderNewerUpdates(page: PageWithStoryPackage, lastUpdateBlockId: String, isLivePage: Option[Boolean])(implicit request: RequestHeader): Result = {
    val newBlocks = page.article.fields.blocks.takeWhile(block => s"block-${block.id}" != lastUpdateBlockId)
    val blocksHtml = views.html.liveblog.liveBlogBlocks(newBlocks, page.article, Edition(request).timezone)
    val timelineHtml = views.html.liveblog.keyEvents("", KeyEventData(newBlocks, Edition(request).timezone))
    val allPagesJson = Seq("timeline" -> timelineHtml, "numNewBlocks" -> newBlocks.size)
    val livePageJson = isLivePage.filter(_ == true).map { _ =>
      "html" -> blocksHtml
    }
    Cached(page)(JsonComponent((allPagesJson ++ livePageJson): _*))
  }

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
    case LiveBlogPage(liveBlog, _) =>
      val blocks = liveBlog.blocks.collect {
        case BodyBlock(id, html, _, title, _, _, _, publishedAt, _, updatedAt, _, _) if html.trim.nonEmpty =>
          TextBlock(id, title, publishedAt, updatedAt, html)
      }.take(number)
      Cached(page)(JsonComponent("blocks" -> Json.toJson(blocks)))
    case _ => Cached(600)(NotFound("Can only return block text for a live blog"))

  }

  private def noAMP(renderPage: => Result)(implicit  request: RequestHeader): Result = {
    if (request.isAmp) NotFound
    else renderPage
  }

  private def renderPageWithBlock(
    maybeRequiredBlockId: Option[String],
    blog: LiveBlogPage,
    modelGen: (Option[(BodyBlock) => Boolean], (BodyBlock) => String) => Option[LiveBlogPageModel[BodyBlock]]
  )(implicit request: RequestHeader) =
    modelGen(
      maybeRequiredBlockId.map(blockId => block => blockId == block.id),
      _.id
    ) map { pageModel =>
      val htmlResponse = () => views.html.liveBlog (blog, pageModel)
      val jsonResponse = () => views.html.liveblog.liveBlogBody (blog, pageModel)
      renderFormat(htmlResponse, jsonResponse, blog, Switches.all)
    } getOrElse NotFound

  private def render(path: String, page: PageWithStoryPackage, pageParam: Option[String])(implicit request: RequestHeader) = page match {
    case blog: LiveBlogPage =>
      noAMP {
        val pageSize = if (blog.article.content.tags.tags.map(_.id).contains("sport/sport")) 30 else 10
        val modelGen = LiveBlogPageModel(
          pageSize = pageSize,
          blog.article.content.fields.blocks
        )_
        pageParam.map(new PageParser().blockId) match {
          case Some(None) => NotFound
          case Some(Some(requiredBlockId)) => renderPageWithBlock(Some(requiredBlockId), blog, modelGen)
          case None => renderPageWithBlock(None, blog, modelGen)
        }
      }

    case minute: MinutePage =>
      noAMP {
        val htmlResponse = () => {
          if (request.isEmail) views.html.articleEmail(minute)
          else                 views.html.minute(minute)
        }

        val jsonResponse = () => views.html.fragments.minuteBody(minute)
        renderFormat(htmlResponse, jsonResponse, minute, Switches.all)
      }

    case article: ArticlePage =>
      val htmlResponse = () => {
        if (request.isEmail) views.html.articleEmail(article)
        else if (article.article.isImmersive) views.html.articleImmersive(article)
        else if (request.isAmp) views.html.articleAMP(article)
        else views.html.article(article)
      }

      val jsonResponse = () => views.html.fragments.articleBody(article)
      renderFormat(htmlResponse, jsonResponse, article, Switches.all)
  }

  def renderLiveBlog(path: String, page: Option[String] = None) =
    Action.async { implicit request =>
      mapModel(path, blocks = true) {// temporarily only ask for blocks too for things we know are new live blogs until until the migration is done and we can always use blocks
        render(path, _, page)
      }
    }

  def renderLiveBlogJson(path: String, lastUpdate: Option[String], rendered: Option[Boolean], isLivePage: Option[Boolean]) = {
    Action.async { implicit request =>
      mapModel(path, blocks = true) { model =>
        (lastUpdate, rendered) match {
          case (Some(lastUpdate), _) => renderNewerUpdates(model, lastUpdate, isLivePage)
          case (None, Some(false)) => blockText(model, 6)
          case (_, _) => render(path, model, None)
        }
      }
    }
  }

  def renderJson(path: String) = {
    Action.async { implicit request =>
      mapModel(path) {
        render(path, _, None)
      }
    }
  }

  def renderArticle(path: String) = {
    Action.async { implicit request =>
      mapModel(path, blocks = request.isEmail) {
        render(path, _, None)
      }
    }
  }

  def mapModel(path: String, blocks: Boolean = false)(render: PageWithStoryPackage => Result)(implicit request: RequestHeader): Future[Result] = {
    lookup(path, blocks) map redirect recover convertApiExceptions map {
      case Left(model) => render(model)
      case Right(other) => RenderOtherStatus(other)
    }
  }

  private def lookup(path: String, blocks: Boolean)(implicit request: RequestHeader): Future[ItemResponse] = {
    val edition = Edition(request)

    log.info(s"Fetching article: $path for edition ${edition.id}: ${RequestLog(request)}")
    val capiItem = LiveContentApi.item(path, edition)
      .showTags("all")
      .showFields("all")
      .showReferences("all")
      .showAtoms("all")

    val capiItemWithBlocks = if (blocks) capiItem.showBlocks("body") else capiItem
    getResponse(capiItemWithBlocks)

  }

  /**
   * convert a response into something we can render, and return it
   * optionally, throw a response if we know it's not right to send the content
   * @param response
   * @return Either[PageWithStoryPackage, Result]
   */
  def redirect(response: ItemResponse)(implicit request: RequestHeader): Either[PageWithStoryPackage, Result] = {
    val supportedContent = response.content.filter(isSupported).map(Content(_))
    val content: Option[PageWithStoryPackage] = supportedContent.map {
      case minute: Article if minute.isUSMinute => MinutePage(minute, RelatedContent(minute, response))
      case liveBlog: Article if liveBlog.isLiveBlog => LiveBlogPage(liveBlog, RelatedContent(liveBlog, response))
      case article: Article => ArticlePage(article, RelatedContent(article, response))
    }

    ModelOrResult(content, response)
  }

}

class PageParser extends RegexParsers {
  def blockId(input: String): Option[String] = {
    def withParser: Parser[Unit] = "with:" ^^ { _ => () }
    def block: Parser[Unit] = "block-" ^^ { _ => () }
    def id: Parser[String] = "[a-zA-Z0-9]+".r
    def expr: Parser[String] = withParser ~> block ~> id

    parse(expr, input) match {
      case Success(matched, _) => Some(matched)
      case _ => None
    }
  }
}
