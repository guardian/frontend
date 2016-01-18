package controllers

import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import com.gu.contentapi.client.model.ItemResponse
import com.gu.util.liveblogs.{Block, BlockToText}
import common._
import conf.LiveContentApi.getResponse
import conf._
import conf.switches.Switches
import conf.switches.Switches.LongCacheSwitch
import liveblog.BodyBlocks
import model._
import org.joda.time.DateTime
import org.jsoup.nodes.Document
import performance.MemcachedAction
import play.api.libs.functional.syntax._
import play.api.libs.json.{Json, _}
import play.api.mvc._
import views.BodyCleaner
import views.support._

import scala.collection.JavaConversions._
import scala.concurrent.Future

trait PageWithStoryPackage extends ContentPage {
  def article: Article
  def related: RelatedContent
  override lazy val item = article
}

case class ArticlePage(article: Article, related: RelatedContent) extends PageWithStoryPackage
case class LiveBlogPage(article: Article, related: RelatedContent) extends PageWithStoryPackage

object ArticleController extends Controller with RendersItemResponse with Logging with ExecutionContexts {

  private def isSupported(c: ApiContent) = c.isArticle || c.isLiveBlog || c.isSudoku
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = mapModel(path, blocks = true)(render(path, _, None))

  private def renderLatestFrom(page: PageWithStoryPackage, lastUpdateBlockId: String)(implicit request: RequestHeader) = {
    val latestBlocks = page.article.fields.blocks.takeWhile(block => s"block-${block.id}" != lastUpdateBlockId)
    val blocksHtml = views.html.liveblog.liveBlogBlocks(latestBlocks, page.article, Edition(request).timezone)
    val timelineHtml = views.html.liveblog.keyEvents(KeyEventData(latestBlocks, Edition(request).timezone))
    Cached(page)(JsonComponent(("html" -> blocksHtml), ("timeline" -> timelineHtml)))
  }

  case class TextBlock(
    id: String,
    title: Option[String],
    publishedDateTime: DateTime,
    lastUpdatedDateTime: Option[DateTime],
    body: String
    )

  implicit val blockWrites = (
    (__ \ "id").write[String] ~
      (__ \ "title").write[Option[String]] ~
      (__ \ "publishedDateTime").write[DateTime] ~
      (__ \ "lastUpdatedDateTime").write[Option[DateTime]] ~
      (__ \ "body").write[String]
    )(unlift(TextBlock.unapply))

  private def blockText(page: PageWithStoryPackage, number: Int)(implicit request: RequestHeader) = page match {
    case LiveBlogPage(liveBlog, _) =>
      val blocks = liveBlog.blocks.collect {
        case Block(id, title, publishedAt, updatedAt, BlockToText(text), _) if text.trim.nonEmpty => TextBlock(id, title, publishedAt, updatedAt, text)
      }.take(number)
      Cached(page)(JsonComponent(("blocks" -> Json.toJson(blocks))))
    case _ => Cached(600)(NotFound("Can only return block text for a live blog"))

  }

  private def render(path: String, page: PageWithStoryPackage, pageNo: Option[Int])(implicit request: RequestHeader) = page match {
    case blog: LiveBlogPage =>
      if (request.isAmp) {
        NotFound
      } else {
        val pageSize = if (blog.article.content.tags.tags.map(_.id).contains("sport/sport")) 50 else 10
        val blocks = BodyBlocks(pageSize = pageSize, extrasOnFirstPage = 10)(blog.article.content.fields.blocks, pageNo)
        blocks match {
          case Some(blocks) =>
            val htmlResponse = () => views.html.liveBlog (blog, blocks)
            val jsonResponse = () => views.html.liveblog.liveBlogBody (blog, blocks)
            renderFormat(htmlResponse, jsonResponse, blog, Switches.all)
          case None => NotFound
        }
      }

    case article: ArticlePage =>
      val htmlResponse = () => if (request.isAmp && !article.article.isImmersive) {
        views.html.articleAMP(article)
      } else {
          if (article.article.isImmersive) {
            views.html.articleImmersive(article)
          } else {
            views.html.article(article)
          }
      }
      val jsonResponse = () => views.html.fragments.articleBody(article)
      renderFormat(htmlResponse, jsonResponse, article, Switches.all)
  }

  def renderLiveBlog(path: String, page: Option[Int] = None) =
    LongCacheAction { implicit request =>
      mapModel(path, blocks = true) {// temporarily only ask for blocks too for things we know are new live blogs until until the migration is done and we can always use blocks
        render(path, _, page)
      }
    }

  def renderLiveBlogJson(path: String, lastUpdate: Option[String], rendered: Option[Boolean]) = {
    LongCacheAction { implicit request =>
      mapModel(path, blocks = true) { model =>
        (lastUpdate, rendered) match {
          case (Some(lastUpdate), _) => renderLatestFrom(model, lastUpdate)
          case (None, Some(false)) => blockText(model, 6)
          case (_, _) => render(path, model, None)
        }
      }
    }
  }

  def renderJson(path: String) = {
    LongCacheAction { implicit request =>
      mapModel(path) {
        render(path, _, None)
      }
    }
  }

  def renderArticle(path: String) = {
    LongCacheAction { implicit request =>
      mapModel(path) {
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
    val capiItemWithBlocks = if (blocks) capiItem.showBlocks("body") else capiItem
    getResponse(capiItemWithBlocks)

  }

  /**
   * convert a response into something we can render, and return it
   * optionally, throw a response if we know it's not right to send the content
   * @param response
   * @return
   */
  def redirect(response: ItemResponse)(implicit request: RequestHeader) = {
    val supportedContent = response.content.filter(isSupported).map(Content(_))
    val content: Option[PageWithStoryPackage] = supportedContent.map {
      case liveBlog: Article if liveBlog.isLiveBlog => LiveBlogPage(liveBlog, RelatedContent(liveBlog, response))
      case article: Article => ArticlePage(article, RelatedContent(article, response))
    }

    ModelOrResult(content, response)
  }

}

object LongCacheAction {
  def apply(block: RequestHeader => Future[Result]) = {
    if (LongCacheSwitch.isSwitchedOn) Action.async { implicit request =>
      // we cannot sensibly decache memcached (does not support surogate keys)
      // so if we are doing the 'soft purge' don't memcache
      block(request)
    } else MemcachedAction { implicit request =>
      block(request)
    }
  }
}
