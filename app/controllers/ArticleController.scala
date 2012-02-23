package controllers

import play.api.mvc._
import content.Article

object ArticleController extends Controller {

  def render(path: String) = Action {
    Article.byId(path) map { renderArticle } getOrElse { NotFound }
  }

  private def renderArticle(article: Article) = Ok(views.html.article(article))
}