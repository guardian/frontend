package controllers

import controllers.ArticleController._
import performance.MemcachedAction
import play.api.mvc.RequestHeader

object ArticleAMPController {

  def renderPath(path: String) = MemcachedAction { implicit request =>
    ArticleController.mapModel(path) { model =>
      render(model, path)
    }
  }

  private def render(model: ArticleWithStoryPackage, path: String)(implicit request: RequestHeader) = model match {
    case blog: LiveBlogPage =>
      MovedPermanently(path)

    case article: ArticlePage =>
      Ok(views.html.articleAMP(article))
  }

}
