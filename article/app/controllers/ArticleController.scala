package controllers

import com.gu.contentapi.client.model.{Content => ApiContent, ItemResponse}
import com.gu.util.liveblogs.{Block, BlockToText}
import common._
import conf.LiveContentApi.getResponse
import conf._
import conf.switches.Switches
import conf.switches.Switches.SoftPurgeWithLongCachingSwitch
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
  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = mapModel(path)(render(path, _))

  private def renderLatestFrom(page: PageWithStoryPackage, lastUpdateBlockId: String)(implicit request: RequestHeader) = {
      val html = withJsoup(BodyCleaner(page.article, page.article.fields.body, amp = false)) {
        new HtmlCleaner {
          def clean(d: Document): Document = {
            val blocksToKeep = d.getElementsByTag("div") takeWhile {
              _.attr("id") != lastUpdateBlockId
            }
            val blocksToDrop = d.getElementsByTag("div") drop blocksToKeep.size

            blocksToDrop foreach {
              _.remove()
            }
            d
          }
        }
      }
      Cached(page)(JsonComponent(html))
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

  private def render(path: String, page: PageWithStoryPackage)(implicit request: RequestHeader) = page match {
    case blog: LiveBlogPage =>
      if (request.isAmp) {
        MovedPermanently(path)
      } else {
        val htmlResponse = () => views.html.liveBlog(blog)
        val jsonResponse = () => views.html.fragments.liveBlogBody(blog)
        renderFormat(htmlResponse, jsonResponse, blog, Switches.all)
      }

    case article: ArticlePage =>
      val htmlResponse = () => if (request.isAmp) {
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

  def renderArticle(path: String, lastUpdate: Option[String], rendered: Option[Boolean]) = {
    if (SoftPurgeWithLongCachingSwitch.isSwitchedOn) Action.async { implicit request =>
        loadArticle(path, lastUpdate, rendered)
    } else MemcachedAction { implicit request =>
      loadArticle(path, lastUpdate, rendered)
    }
  }

  private def loadArticle(path: String, lastUpdate: Option[String], rendered: Option[Boolean])(implicit request: RequestHeader): Future[Result] = {
    mapModel(path) { model =>
      (lastUpdate, rendered) match {
        case (Some(lastUpdate), _) => renderLatestFrom(model, lastUpdate)
        case (None, Some(false)) => blockText(model, 6)
        case (_, _) => render(path, model)
      }
    }
  }

  def mapModel(path: String)(render: PageWithStoryPackage => Result)(implicit request: RequestHeader): Future[Result] = {
    lookup(path) map redirect recover convertApiExceptions map {
      case Left(model) => render(model)
      case Right(other) => RenderOtherStatus(other)
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader): Future[ItemResponse] = {
    val edition = Edition(request)

    log.info(s"Fetching article: $path for edition ${edition.id}: ${RequestLog(request)}")
    getResponse(LiveContentApi.item(path, edition)
      .showTags("all")
      .showFields("all")
      .showReferences("all")
    )

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
