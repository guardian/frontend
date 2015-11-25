package model

import com.google.inject.{Inject, Singleton}
import com.gu.facia.api.models.CollectionConfig
import com.gu.identity.model.{SavedArticle, SavedArticles}
import common.{ExecutionContexts, Edition, Pagination}
import conf.LiveContentApi
import conf.LiveContentApi._
import layout.{ItemClasses, FaciaCard, ContentCard}
import model.{Content => ApiContent}
import services.{FaciaContentConvert, IdRequestParser, IdentityRequest, IdentityUrlBuilder}
import implicits.Articles._
import cards._

import scala.concurrent.Future

case class SaveForLaterItem (
  content: Content,
  savedArticle: SavedArticle) extends Ordered[SaveForLaterItem] {

  def compare(other: SaveForLaterItem) : Int = other.savedArticle.date.compareTo(this.savedArticle.date)

  val contentCard = FaciaCard.fromTrail(
    FaciaContentConvert.frontendContentToFaciaContent(content),
    CollectionConfig.empty,
    ItemClasses(mobile = cards.SavedForLater, tablet = cards.SavedForLater),
    showSeriesAndBlogKickers = false
  )
}

case class SaveForLaterPageData(
  formActionUrl: String,
  savedItems: List[SaveForLaterItem],
  pagination: Pagination,
  paginationUrl: String,
  totalArticlesSaved: Int,
  shortUrls: List[String])

@Singleton
class SaveForLaterDataBuilder @Inject()(idUrlBuilder: IdentityUrlBuilder) extends ExecutionContexts {

  def apply(savedArticles: SavedArticles, idRequest: IdentityRequest, pageNum: Int): Future[SaveForLaterPageData] = {

    val articles = savedArticles.getPage(pageNum)
    val shortUrls = articles.map(_.shortUrl)

    getResponse(LiveContentApi.search(Edition.defaultEdition)
      .ids(shortUrls.map(_.drop(1)).mkString(","))
      .showFields("all")
      .showElements ("all")
    ).map(r => {

      val items = r.results.flatMap { result =>
        for {
          content <- Some(ApiContent(result))
          article <- articles.find( article => article.id == content.id)
        } yield {
          SaveForLaterItem(content, article)
        }
      }

      SaveForLaterPageData(
        idUrlBuilder.buildUrl("/saved-for-later", idRequest),
        items.sorted,
        Pagination(pageNum, savedArticles.numPages, savedArticles.totalSaved),
        idUrlBuilder.buildUrl("/saved-for-later"),
        savedArticles.totalSaved,
        shortUrls
      )
    })
  }
}

