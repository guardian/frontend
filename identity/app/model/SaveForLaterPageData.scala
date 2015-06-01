package model

import com.google.inject.{Inject, Singleton}
import com.gu.identity.model.SavedArticles
import services.{IdRequestParser, IdentityRequest, IdentityUrlBuilder}


@Singleton
class SaveForLaterDataBuilder @Inject()(idRequestParser: IdRequestParser) {

  protected def formActionUrl(idUrlBuilder: IdentityUrlBuilder, idRequest: IdentityRequest, path: String): String = idUrlBuilder.buildUrl(path, idRequest)

  def apply(savedArticlesForPage: List[Content], allSavedArticles: SavedArticles, identityRequest: IdentityRequest, pageNum: Int) = {
    def getAdjacentPageNumber(maybePage: Option[Int]) : Option[String] = maybePage match {
      case Some (page) => Some(formActionUrl(idUrlBuilder, idRequest, "/saved-for-later/%d".format(page)))
      case _ => None
    }

    SaveForLaterPageData(
      formActionUrl(idUrlBuilder, idRequest, "/saved-for-later/%d".format(pageNum)),
      savedArticlesForPage,
      allSavedArticles.totalSaved,
      allSavedArticles.totalPages,
      allSavedArticles.numPages,
      pageNum + 1,
      getAdjacentPageNumber(allSavedArticles.prevPage(pageNum)),
      getAdjacentPageNumber(allSavedArticles.nextPage(pageNum))
    )
  }

}
case class SaveForLaterPageData(formActionUrl: String, savedArticles: List[Content], totalArticlesSaved: Int, totalPages: Int, pageNum: Int, prevPage: Option[String], nextPage: Option[String]  )
