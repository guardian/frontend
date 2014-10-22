package controllers

import com.gu.contentapi.client.model.ItemResponse
import common._
import conf._
import model._
import org.jsoup.nodes.Document
import performance.MemcachedAction
import play.api.mvc.{Content => _, _}
import views.BodyCleaner
import views.support._

import scala.collection.JavaConversions._
import scala.concurrent.Future

trait ArticleWithStoryPackage {
  def article: Article
  def related: RelatedContent
}
case class ArticlePage(article: Article, related: RelatedContent) extends ArticleWithStoryPackage
case class LiveBlogPage(article: LiveBlog, related: RelatedContent) extends ArticleWithStoryPackage

object ArticleController extends Controller with Logging with ExecutionContexts {

  def renderArticle(path: String) = MemcachedAction { implicit request =>
    lookup(path) map {
      case Left(model) => render(model)
      case Right(other) => RenderOtherStatus(other)
    }
  }

  def renderLatestFrom(path: String, lastUpdateBlockId: String) = MemcachedAction { implicit request =>
    lookup(path) map {
      case Right(other) => RenderOtherStatus(other)
      case Left(model) =>
        val html = withJsoup(BodyCleaner(model.article, model.article.body)) {
          new HtmlCleaner {
            def clean(d: Document): Document = {
              val blocksToKeep = d.getElementsByTag("div") takeWhile { _.attr("id") != lastUpdateBlockId }
              val blocksToDrop = d.getElementsByTag("div") drop blocksToKeep.size

              blocksToDrop foreach { _.remove() }
              d
            }
          }
        }
        Cached(model.article)(JsonComponent(html))
    }
  }



  def renderLatest(path: String, lastUpdate: Option[String]) = lastUpdate map { renderLatestFrom(path, _) } getOrElse { renderArticle(path) }

  private def lookup(path: String)(implicit request: RequestHeader): Future[Either[ArticleWithStoryPackage, Result]] = {
    val edition = Edition(request)
    log.info(s"Fetching article: $path for edition ${edition.id}: ${RequestLog(request)}")
    val response: Future[ItemResponse] = LiveContentApi.item(path, edition)
      .showRelated(InlineRelatedContentSwitch.isSwitchedOn)
      .showTags("all")
      .showFields("all")
      .showReferences("all")
      .response

    val result = response map { response =>
      val storyPackage = response.storyPackage map { Content(_) }
      val related = response.relatedContent map { Content(_) }


      val supportedContent = response.content.filter { c => c.isArticle || c.isLiveBlog || c.isSudoku }
      val content = supportedContent map { Content(_) } map {
        case liveBlog: LiveBlog => LiveBlogPage(liveBlog, RelatedContent(liveBlog, response))
        case article: Article => ArticlePage(article, RelatedContent(article, response))
      }

      ModelOrResult(content, response)
    }

    result recover convertApiExceptions
  }

  private def render(model: ArticleWithStoryPackage)(implicit request: RequestHeader) = model match {
    case blog: LiveBlogPage =>
      val htmlResponse = () => views.html.liveBlog(blog)
      val jsonResponse = () => views.html.fragments.liveBlogBody(blog)
      renderFormat(htmlResponse, jsonResponse, model.article, Switches.all)

    case article: ArticlePage =>
      val htmlResponse = () => views.html.article(article)
      val jsonResponse = () => views.html.fragments.articleBody(article)
      renderFormat(htmlResponse, jsonResponse, model.article, Switches.all)
  }
}
