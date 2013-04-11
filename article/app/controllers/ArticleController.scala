package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ Content => _, _ }
import play.api.libs.concurrent.Execution.Implicits._
import concurrent.Future
import com.gu.openplatform.contentapi.ApiError

case class ArticlePage(article: Article, storyPackage: List[Trail], edition: String)

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
    val edition = Site(request).edition
    log.info(s"Fetching article: $path for edition $edition")
    ContentApi.item(path, edition)
      .showExpired(true)
      .showTags("all")
      .showFields("all")
      .response.map{ response =>

      val articleOption = response.content.filter { _.isArticle } map { new Article(_) }
      val storyPackage = response.storyPackage map { new Content(_) }

      val model = articleOption.map { article => ArticlePage(article, storyPackage.filterNot(_.id == article.id), edition) }
      ModelOrResult(model, response)
    }.recover{ suppressApiNotFound }

  }

  private def renderArticle(model: ArticlePage)(implicit request: RequestHeader): Result =
    request.getQueryString("callback").map { callback =>
      JsonComponent(views.html.fragments.articleBody(model.article, model.storyPackage, model.edition))
    } getOrElse {
      Cached(model.article)(
        Ok(Compressed(views.html.article(model.article, model.storyPackage, model.edition)))
      )
    }
}
