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

case class ZoneColour(className: String, selectors: List[String], zoneName: String, hexCode: String)

object StyleGuideController extends Controller with Logging {

  def renderIndex = Action { implicit request =>
    val page = Page(canonicalUrl = None, "style-guide", "style-guide", "Style guide: home", "GFE:Style-guide")
    Cached(60) {
      Ok(Compressed(views.html.styleGuide.index(page)))
    }
  }

  def renderTypography = Action { implicit request =>
    val page = Page(canonicalUrl = None, "typography", "style-guide", "Typography", "GFE:Style-guide:typography")
    Cached(60) {
      Ok(Compressed(views.html.styleGuide.typography(page)))
    }
  }

  def renderZones = Action { implicit request =>
    val page = Page(canonicalUrl = None, "zones", "style-guide", "Zones", "GFE:Style-guide:zones")

    val zoneList = Seq(
      ZoneColour("zone-news", List(".zone-news", ".zone-journalismcompetition", ".zone-global-development", ".zone-law", ".zone-theobserver", ".zone-science", ".zone-theguardian", ".zone-education", ".zone-technology", ".zone-society", ".zone-politics", ".zone-uk", ".zone-media", ".zone-world"), "News (default)", "#D61D00"),
      ZoneColour("zone-environment", List(".zone-environment"), "Environment", "#4A7801"),
      ZoneColour("zone-culture", List(".zone-childrens-books-site", ".zone-tv-and-radio", ".zone-artanddesign", ".zone-stage", ".zone-culture", ".zone-film", ".zone-books", ".zone-music"), "Culture", "#D1008B"),
      ZoneColour("zone-lifeandstyle", List(".zone-lifeandstyle", ".zone-fashion"), "Life and style", "#EA721E"),
      ZoneColour("zone-sport", List(".zone-sport", ".zone-football"), "Sport", "#20A111"),
      ZoneColour("zone-travel", List(".zone-travel"), "Travel", "#066EC9"),
      ZoneColour("zone-business", List(".zone-business"), "Business", "#004179"),
      ZoneColour("zone-commentisfree", List(".zone-commentisfree"), "Comment is Free", "#004179"),
      ZoneColour("zone-money", List(".zone-money"), "Money", "#7D0068")
    )

    Cached(60) {
      Ok(Compressed(views.html.styleGuide.zones(page, zoneList)))
    }
  }

  def renderSprites = Action { implicit request =>
    val page = Page(canonicalUrl = None, "sprites", "style-guide", "CSS sprites", "GFE:Style-guide:sprites")
    Cached(60) {
      Ok(Compressed(views.html.styleGuide.sprites(page)))
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
    val edition = Site(request).edition
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

  def cssHelpers = Action { implicit request =>
    val page = Page(canonicalUrl = None, "css-helpers", "style-guide", "CSS helpers", "GFE:Style-guide:css-helpers")
    Cached(60) {
      Ok(Compressed(views.html.styleGuide.csshelpers(page)))
    }
  }

  def codingStandards = Action { implicit request =>
    val page = Page(canonicalUrl = None, "coding-standards", "style-guide", "Coding standards", "GFE:Style-guide:coding-standards")
    Cached(60) {
      Ok(Compressed(views.html.styleGuide.codingstandards(page)))
    }
  }

}
