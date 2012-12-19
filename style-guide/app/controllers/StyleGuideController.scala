package controllers

import common._
import model._
import conf._
import com.gu.openplatform.contentapi.model.ItemResponse
import play.api.mvc.{ Controller, Action }
import play.api.mvc.{ Content => _, _ }
import play.api.libs.concurrent.Akka
import play.api.Play.current

case class ArticlePage(article: Article, storyPackage: List[Trail], edition: String)

object StyleGuideController extends Controller with Logging {

  def renderIndex = Action { implicit request =>
    val page = Page(canonicalUrl = None, "style-guide", "style-guide", "Style guide", "GFE:Style-guide")
    Cached(60) {
      Ok(Compressed(views.html.styleGuide.index(page)))
    }
  }

  def renderTypography = Action { implicit request =>
    val page = Page(canonicalUrl = None, "typography", "style-guide", "Typography", "GFE:Style-guide")
    Cached(60) {
      Ok(Compressed(views.html.styleGuide.typography(page)))
    }
  }

  def renderModules() = Action { implicit request =>
    val path = "politics/2012/dec/18/andrew-mitchell-deputy-chief-whip"
    val promiseOfArticle = Akka.future(lookupSingleArticle(path))
    Async {
      promiseOfArticle.map(_.map { renderModuleOutput }.getOrElse { NotFound })
    }
  }

  private def lookupSingleArticle(path: String)(implicit request: RequestHeader): Option[ArticlePage] = suppressApi404 {
    val edition = Edition(request, Configuration)
    log.info("Fetching article: " + path + " for edition " + edition)
    val response: ItemResponse = ContentApi.item(path, edition)
      .showInlineElements("picture")
      .showTags("all")
      .showFields("all")
      .response

    val articleOption = response.content.filter { _.isArticle } map { new Article(_) }
    val storyPackage = response.storyPackage map { new Content(_) }

    articleOption map { article => ArticlePage(article, storyPackage.filterNot(_.id == article.id), edition) }
  }

  private def renderModuleOutput(model: ArticlePage)(implicit request: RequestHeader) = {
    val page = Page(canonicalUrl = None, "modules", "style-guide", "Modules", "GFE:Style-guide:modules")

    Cached(60) {
      Ok(Compressed(views.html.styleGuide.modules(page, model.article, model.edition, model.storyPackage)))
    }
  }

}
