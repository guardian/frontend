package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import conf._
import frontend.common._
import play.api.mvc.{Controller, Action}

case class ArticleAndRelated(article: Article, related: List[Trail], storyPackage: List[Trail])
  
object ArticleController extends Controller with Logging {

  def render(path: String) = Action {
    lookup(path) map { renderArticle } getOrElse { NotFound }
  }

  private def lookup(path: String): Option[ArticleAndRelated] = suppressApi404 {
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
      
    val article = response.content.filter { _.isArticle } map { new Article(_) }    
    val related = response.relatedContent map { new Content(_) }
    val storyPackage = response.storyPackage map { new Content(_) }
    
    article map { ArticleAndRelated(_, related, storyPackage) }
  }
    
  private def renderArticle(model: ArticleAndRelated) =
    Ok(views.html.article(model.article, model.related, model.storyPackage))
}
