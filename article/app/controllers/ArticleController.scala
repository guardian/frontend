package controllers

import common._
import conf._
import model._
import play.api.mvc.{ Content => _, _ }
import views.support._
import org.jsoup.nodes.Document
import collection.JavaConversions._
import views.BodyCleaner


case class ArticlePage(article: Article, storyPackage: List[Trail])

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
            val html = withJsoup(BodyCleaner(model.article)){
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

      val articleOption = response.content.filter {c => c.isArticle || c.isSudoku} map { new Article(_) }
      val storyPackage = SupportedContentFilter(response.storyPackage map { Content(_) }).toList

      val model = articleOption.map { article => ArticlePage(article, storyPackage.filterNot(_.id == article.id)) }
      ModelOrResult(model, response)
    }.recover{ suppressApiNotFound }
  }

  private def renderExpired(model: ArticlePage)(implicit request: RequestHeader): Result = Cached(model.article) {
    if (request.isJson) {
      JsonComponent(model.article, Switches.all, views.html.fragments.expiredBody(model.article))
    } else {
      Gone(views.html.expired(model.article))
    }
  }

  private def renderArticle(model: ArticlePage)(implicit request: RequestHeader): Result = {
    val htmlResponse = () => views.html.article(model.article, model.storyPackage)
    val jsonResponse = () => views.html.fragments.articleBody(model.article, model.storyPackage)
    renderFormat(htmlResponse, jsonResponse, model.article, Switches.all)
  }

}
