package controllers

import common._
import conf._
import model._
import play.api.mvc.{ Content => _, _ }
import views.support._
import org.jsoup.nodes.Document
import collection.JavaConversions._
import views.BodyCleaner

trait ArticleWithStoryPackage {
  def article: Article
  def storyPackage: List[Trail]
}
case class ArticlePage(article: Article, storyPackage: List[Trail]) extends ArticleWithStoryPackage
case class LiveBlogPage(article: LiveBlog, storyPackage: List[Trail]) extends ArticleWithStoryPackage

object ArticleController extends Controller with Logging with ExecutionContexts {

  def render(path: String) = Action { implicit request =>
    val promiseOfArticle = lookup(path)
    Async {
      promiseOfArticle.map {
        case Left(model) if model.article.isExpired => renderExpired(model)
        case Left(model) => renderArticle(model)
        case Right(notFound) => notFound
      }
    }
  }

  def renderLatest(path: String, lastUpdate: Option[String]) = lastUpdate.map{ blockId =>
    Action { implicit request =>
      val promiseOfArticle = lookup(path)
      Async {
        promiseOfArticle.map {
          case Left(model) if model.article.isExpired => renderExpired(model)
          case Left(model) =>
            val html = withJsoup(BodyCleaner(model.article, model.article.body)){
              new HtmlCleaner {
                def clean(d: Document): Document = {
                  val blocksToKeep = d.getElementsByTag("div").takeWhile(_.attr("id") != blockId)
                  d.getElementsByTag("div").drop(blocksToKeep.size).foreach(_.remove())
                  d
                }
              }
            }
            JsonComponent(html)
          case Right(notFound) => notFound
        }
      }
    }
  }.getOrElse(render(path))

  private def lookup(path: String)(implicit request: RequestHeader) = {
    val edition = Edition(request)
    log.info(s"Fetching article: $path for edition ${edition.id}")
    ContentApi.item(path, edition)
      .showExpired(true)
      .showTags("all")
      .showFields("all")
      .response.map{ response =>

      val articleOption = response.content.filter {c => c.isArticle || c.isLiveBlog || c.isSudoku} map { Content(_) }
      val storyPackage = SupportedContentFilter(response.storyPackage map { Content(_) }).toList

      val model = articleOption.map { model =>
        model match {
          case liveBlog: LiveBlog => LiveBlogPage(liveBlog, storyPackage.filterNot(_.id == model.id))
          case article: Article => ArticlePage(article, storyPackage.filterNot(_.id == model.id))
        }
      }
      ModelOrResult(model, response)
    }.recover{ suppressApiNotFound }
  }

  private def renderExpired(model: ArticleWithStoryPackage)(implicit request: RequestHeader): Result = Cached(model.article) {
    if (request.isJson) {
      JsonComponent(model.article, Switches.all, views.html.fragments.expiredBody(model.article))
    } else {
      Gone(views.html.expired(model.article))
    }
  }

  private def renderArticle(model: ArticleWithStoryPackage)(implicit request: RequestHeader): Result = {
    model match {
      case blog: LiveBlogPage =>
        val htmlResponse = () => views.html.liveBlog(blog)
        val jsonResponse = () => views.html.fragments.liveBlog(blog)
        renderFormat(htmlResponse, jsonResponse, model.article, Switches.all)
      case article: ArticlePage =>
        val htmlResponse = () => views.html.article(article)
        val jsonResponse = () => views.html.fragments.articleBody(article)
        renderFormat(htmlResponse, jsonResponse, model.article, Switches.all)
    }
  }

}