package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import conf._
import common._
import model._
import play.api.mvc.{ Content => _, _ }

case class ArticlePage(article: Article, storyPackage: List[Trail])

object ArticleController extends Controller with Logging {

  def render(path: String) = Action { implicit request =>
    lookup(path).map { renderArticle }.getOrElse { NotFound }
  }

  private def lookup(path: String)(implicit request: RequestHeader): Option[ArticlePage] = suppressApi404 {
    val edition = Edition(request, Configuration)
    log.info("Fetching article: " + path + " for edition " + edition)
    val response: ItemResponse = ContentApi.item(path, edition)
      .showTags("all")
      .showFields("all")
      .response

    val articleOption = response.content.filter { _.isArticle } map { new Article(_) }
    val storyPackage = response.storyPackage map { new Content(_) }

    articleOption map { article => ArticlePage(article, storyPackage.filterNot(_.id == article.id)) }
  }

  private def renderArticle(model: ArticlePage)(implicit request: RequestHeader): Result =
    CachedOk(model.article) {
      Compressed(views.html.article(model.article, model.storyPackage))
    }
}