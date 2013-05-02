package controllers

import common._
import conf._
import model._
import play.api.mvc.{ Content => _, _ }
import play.api.libs.concurrent.Execution.Implicits._

case class ArticlePage(article: Article, storyPackage: List[Trail])

object ArticleController extends Controller with Logging {

  def render(path: String) = Action { implicit request =>
    val promiseOfArticle = lookup(path)
    Async {
      promiseOfArticle.map {
        case Left(model) if model.article.isExpired => Gone(Compressed(views.html.expired(model.article)))
        case Left(model) => renderArticle(model)
        case Right(notFound) => notFound
      }
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader) = {
    val edition = Edition(request)
    log.info(s"Fetching article: $path for edition ${edition.id}")
    ContentApi.item(path, edition)
      .showExpired(true)
      .showTags("all")
      .showFields("all")
      .response.map{ response =>

      val articleOption = response.content.filter { _.isArticle } map { new Article(_) }
      val storyPackage = response.storyPackage map { new Content(_) }

      val model = articleOption.map { article => ArticlePage(article, storyPackage.filterNot(_.id == article.id)) }
      ModelOrResult(model, response)
    }.recover{ suppressApiNotFound }

  }

  private def renderArticle(model: ArticlePage)(implicit request: RequestHeader): Result = {
    val htmlResponse = views.html.article(model.article, model.storyPackage)
    val jsonResponse = views.html.fragments.articleBody(model.article, model.storyPackage)
    renderFormat(htmlResponse, jsonResponse, model.article, Switches.all)
  }
  
}
