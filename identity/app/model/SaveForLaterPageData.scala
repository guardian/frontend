package model

import com.google.inject.{Inject, Singleton}
import com.gu.identity.model.SavedArticles
import services.{IdRequestParser, IdentityRequest, IdentityUrlBuilder}
import implicits.Articles._



@Singleton
class SaveForLaterDataBuilder @Inject()(idUrlBuilder: IdentityUrlBuilder) {

  protected def formActionUrl(idRequest: IdentityRequest, path: String): String = idUrlBuilder.buildUrl(path, idRequest)

  def apply(savedArticlesForPage: List[Content], allSavedArticles: SavedArticles, idRequest: IdentityRequest, pageNum: Int) = {
    def getAdjacentPageNumber(maybePage: Option[Int]) : Option[String] = maybePage match {
      case Some (page) => Some(formActionUrl(idRequest, "/saved-for-later-page/%d".format(page)))
      case _ => None
    }

    SaveForLaterPageData(
      formActionUrl(idRequest, "/saved-for-later/%d".format(pageNum)),
      savedArticlesForPage,
      allSavedArticles.totalSaved,
      allSavedArticles.numPages,
      pageNum + 1,
      getAdjacentPageNumber(allSavedArticles.prevPage(pageNum)),
      getAdjacentPageNumber(allSavedArticles.nextPage(pageNum))
    )
  }

}
case class SaveForLaterPageData(formActionUrl: String, articles: List[Content], totalArticlesSaved: Int, totalPages: Int, pageNum: Int, prevPage: Option[String], nextPage: Option[String]  )
