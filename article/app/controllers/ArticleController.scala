package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ Content => _, _ }
import play.api.libs.concurrent.Akka
import play.api.Play.current

case class ArticlePage(article: Article, storyPackage: List[Trail], edition: String)

object ArticleController extends Controller with Logging {

  def render(path: String) = Action { implicit request =>
    val promiseOfArticle = Akka.future(lookup(path))
    Async {
      promiseOfArticle.map {
        case Left(model) => renderArticle(model)
        case Right(notFound) => notFound
      }
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader) = suppressApi404 {
    val edition = Edition(request, Configuration)
    log.info("Fetching article: " + path + " for edition " + edition)
    val response: ItemResponse = ContentApi.item(path, edition)
      .showTags("all")
      .showFields("all")
      .response

    val articleOption = response.content.filter { _.isArticle } map { new Article(_) }
    val storyPackage = response.storyPackage map { new Content(_) }

    val model = articleOption.map { article => ArticlePage(article, storyPackage.filterNot(_.id == article.id), edition) }
    ModelOrNotFound(model, response)
  }

  private def renderArticle(model: ArticlePage)(implicit request: RequestHeader): Result =
    request.getQueryString("callback").map { callback =>
      JsonComponent(views.html.fragments.articleBody(model.article))
    } getOrElse {
      Cached(model.article)(
        Ok(Compressed(views.html.article(model.article, model.storyPackage, model.edition)))
      )
    }
}
