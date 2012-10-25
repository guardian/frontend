package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import model._
import conf._
import play.api.mvc.{ Content => _, _ }
import play.api.libs.concurrent.Akka
import play.api.Play.current
import play.api.libs.Crypto

case class ArticlePage(article: Article, storyPackage: List[Trail])

object ArticleController extends Controller with Logging {

  def render(path: String) = Action { implicit request =>
    val promiseOfArticle = Akka.future(lookup(path))
    Async {
      promiseOfArticle.map(_.map { renderArticle }.getOrElse { NotFound })
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader): Option[ArticlePage] = suppressApi404 {
    val edition = Edition(request, Configuration)
    log.info("Fetching article: " + path + " for edition " + edition)
    val response: ItemResponse = ContentApi.item(path, edition)
      .showInlineElements("picture")
      .showTags("all")
      .showFields("all")
      .response

    val articleOption = response.content.filter { _.isArticle } map { new Article(_) }
    val storyPackage = response.storyPackage map { new Content(_) }

    articleOption map { article => ArticlePage(article, storyPackage.filterNot(_.id == article.id)) }
  }

  private def renderArticle(model: ArticlePage)(implicit request: RequestHeader): Result =
    request.getQueryString("callback").map { callback =>
      JsonComponent(views.html.fragments.articleBody(model.article), Some(Crypto.sign(model.article.lastModified.toString)))
    }.getOrElse(CachedOk(model.article)(Compressed(views.html.article(model.article, model.storyPackage))))

}
