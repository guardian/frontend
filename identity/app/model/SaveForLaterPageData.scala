package model

import com.google.inject.{Inject, Singleton}
import com.gu.facia.api.models.CollectionConfig
import com.gu.identity.model.SavedArticles
import common.Pagination
import layout.{ItemClasses, FaciaCard, ContentCard}
import services.{FaciaContentConvert, IdRequestParser, IdentityRequest, IdentityUrlBuilder}
import implicits.Articles._
import cards._


@Singleton
class SaveForLaterDataBuilder @Inject()(idUrlBuilder: IdentityUrlBuilder) {

  def apply(savedArticlesForPage: List[Content], allSavedArticles: SavedArticles, idRequest: IdentityRequest, pageNum: Int) = {

    val contentCards: List[ContentCard] = savedArticlesForPage.map { article =>
      FaciaCard.fromTrail(FaciaContentConvert.frontentContentToFaciaContent(article), CollectionConfig.empty, ItemClasses(mobile = cards.SavedForLater, tablet = cards.SavedForLater), false)
    }

    SaveForLaterPageData(
      idUrlBuilder.buildUrl("/saved-for-later-page?page=%d".format(pageNum), idRequest),
      contentCards,
      Pagination(pageNum, allSavedArticles.numPages, allSavedArticles.totalSaved),
      idUrlBuilder.buildUrl("/saved-for-later-page", idRequest),
      allSavedArticles.totalSaved
    )
  }
}
case class SaveForLaterPageData(formActionUrl: String, contentCards: List[ContentCard], pagination: Pagination, pageUrl: String, totalArticlesSaved: Int)
