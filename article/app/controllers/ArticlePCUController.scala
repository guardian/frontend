package controllers

import controllers.ArticleController._
import performance.MemcachedAction
import play.api.mvc.RequestHeader

object ArticlePCUController {

  def renderPath(path: String) = MemcachedAction { implicit request =>
    println(s"path: $path")
    ArticleController.mapModel(path) { model =>
      println(s"path 2: $path")
      render(model, path)
    }
  }

  private def render(model: ArticleWithStoryPackage, path: String)(implicit request: RequestHeader) = model match {
    case blog: LiveBlogPage =>
      {println("woo")
      MovedPermanently(path)}

    case article: ArticlePage =>
      Ok(views.html.articlePCU(article))
  }

}
