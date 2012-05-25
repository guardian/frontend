package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import conf._
import common._
import play.api.mvc.{ Content => Unwanted, _ }

case class ArticlePage(article: Article, related: List[Trail], storyPackage: List[Trail])
object ArticleController extends Controller with Logging {

  def render(path: String) = Action {
    lookup(path).map { renderArticle }.getOrElse { NotFound }
  }

  private def lookup(path: String): Option[ArticlePage] = suppressApi404 {
    log.info("Fetching article: " + path)
    val response: ItemResponse = ContentApi.item
      .showInlineElements("picture")
      .showTags("all")
      .showFields("all")
      .showMedia("all")
      .showRelated(true)
      .showStoryPackage(true)
      .itemId(path)
      .response

    val articleOption = response.content.filter { _.isArticle } map { new Article(_) }
    val related = response.relatedContent map { new Content(_) }
    val storyPackage = response.storyPackage map { new Content(_) }

    articleOption map { article => ArticlePage(article, related, storyPackage.filterNot(_.id == article.id)) }
  }

  private def renderArticle(model: ArticlePage): Result =
    CachedOk(model.article) {
      views.html.article(model.article, model.related, model.storyPackage)
    }
}
