package model

import com.google.inject.{Inject, Singleton}
import com.gu.facia.api.models.CollectionConfig
import com.gu.identity.model.SavedArticles
import layout.{ItemClasses, FaciaCard, ContentCard}
import services.{FaciaContentConvert, IdRequestParser, IdentityRequest, IdentityUrlBuilder}
import implicits.Articles._
import cards._


@Singleton
class SaveForLaterDataBuilder @Inject()(idUrlBuilder: IdentityUrlBuilder) {

  protected def formActionUrl(idRequest: IdentityRequest, path: String): String = idUrlBuilder.buildUrl(path, idRequest)

  def apply(savedArticlesForPage: List[Content], allSavedArticles: SavedArticles, idRequest: IdentityRequest, pageNum: Int) = {
    def getAdjacentPageNumber(maybePage: Option[Int]) : Option[String] = maybePage match {
      case Some (page) => Some(formActionUrl(idRequest, "/saved-for-later-page/%d".format(page)))
      case _ => None
    }

    val contentCards: List[ContentCard] = savedArticlesForPage.map { article =>
      FaciaCard.fromTrail(FaciaContentConvert.frontentContentToFaciaContent(article), CollectionConfig.empty, ItemClasses(mobile = cards.SavedForLater, tablet = cards.SavedForLater), false)
    }

    SaveForLaterPageData(
      formActionUrl(idRequest, "/saved-for-later-page/%d".format(pageNum)),
      contentCards,
      allSavedArticles.totalSaved,
      allSavedArticles.numPages,
      pageNum,
      getAdjacentPageNumber(allSavedArticles.prevPage(pageNum)),
      getAdjacentPageNumber(allSavedArticles.nextPage(pageNum))
    )
  }

}
case class SaveForLaterPageData(formActionUrl: String, contentCards: List[ContentCard], totalArticlesSaved: Int, totalPages: Int, pageNum: Int, prevPage: Option[String], nextPage: Option[String]  )
