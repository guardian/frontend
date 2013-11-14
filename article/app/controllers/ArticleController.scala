package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import org.jsoup.nodes.Document
import play.api.mvc.{ Content => _, _ }
import views.support._
import views.BodyCleaner
import scala.concurrent.Future
import scala.collection.JavaConversions._

trait ArticleWithStoryPackage {
  def article: Article
  def storyPackage: List[Trail]
}
case class ArticlePage(article: Article, storyPackage: List[Trail]) extends ArticleWithStoryPackage
case class LiveBlogPage(article: LiveBlog, storyPackage: List[Trail]) extends ArticleWithStoryPackage

object ArticleController extends Controller with Logging with ExecutionContexts {

  def renderArticle(path: String) = Action.async { implicit request =>
    lookup(path) map {
      case Left(model) if model.article.isExpired => renderExpired(model)
      case Left(model) => render(model)
      case Right(notFound) => notFound
    }
  }

  def renderLatestFrom(path: String, lastUpdateBlockId: String) = Action.async { implicit request =>
    lookup(path) map {
      case Left(model) if model.article.isExpired => renderExpired(model)
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

      case Right(notFound) => notFound
    }
  }

  def renderLatest(path: String, lastUpdate: Option[String]) = lastUpdate map { renderLatestFrom(path, _) } getOrElse { renderArticle(path) }

  private def lookup(path: String)(implicit request: RequestHeader): Future[Either[ArticleWithStoryPackage, SimpleResult]] = {
    val edition = Edition(request)
    log.info(s"Fetching article: $path for edition ${edition.id}")
    val response: Future[ItemResponse] = SwitchingContentApi().item(path, edition)
      .showExpired(true)
      .showTags("all")
      .showFields("all")
      .response

    val result = response map { response =>
      val storyPackage = response.storyPackage map { Content(_) }

      val supportedContent = response.content.filter { c => c.isArticle || c.isLiveBlog || c.isSudoku }
      val content = supportedContent map { Content(_) } map {
        case liveBlog: LiveBlog => LiveBlogPage(liveBlog, storyPackage.filterNot(_.id == liveBlog.id))
        case article: Article => ArticlePage(article, storyPackage.filterNot(_.id == article.id))
      }

      ModelOrResult(content, response)
    }

    result recover suppressApiNotFound
  }

  private def renderExpired(model: ArticleWithStoryPackage)(implicit request: RequestHeader) = Cached(model.article) {
    if (request.isJson) {
      JsonComponent(model.article, Switches.all, views.html.fragments.expiredBody(model.article))
    } else {
      Gone(views.html.expired(model.article))
    }
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