package services.dotcomponents

import agents.CuratedContentAgent
import common.Edition
import model.dotcomrendering.OnwardCollectionResponse
import model.{ArticlePage, ContentFormat}

class OnwardsPicker(curatedContentAgent: CuratedContentAgent) {
  def forArticle(article: ArticlePage, edition: Edition): Seq[OnwardCollectionResponse] = {
    val format = article.article.content.metadata.format.getOrElse(ContentFormat.defaultContentFormat)
    val curatedContent = curatedContentAgent.getTrails(format.theme, edition)

    Seq(
      OnwardCollectionResponse(
        heading = "Curated content",
        trails = curatedContent,
      ),
    )
  }
}
