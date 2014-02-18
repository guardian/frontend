package model.commercial.books

import model.commercial.{AdAgent, Segment, Ad}
import common.ExecutionContexts
import scala.concurrent.Future
import model.commercial.intersects

case class Book(title: String,
                author: Option[String],
                isbn: String,
                price: Option[Double] = None,
                offerPrice: Option[Double] = None,
                description: Option[String] = None,
                jacketUrl: Option[String],
                buyUrl: Option[String] = None,
                position: Option[Int] = None,
                category: Option[String] = None,
                keywords: Seq[String] = Nil)
  extends Ad {

  def isTargetedAt(segment: Segment): Boolean = intersects(keywords, segment.context.keywords)
}


object BestsellersAgent extends AdAgent[Book] with ExecutionContexts {

  private val feeds = Seq(
    GeneralBestsellersFeed,
    TravelBestsellersFeed,
    ScienceBestsellersFeed,
    TechnologyBestsellersFeed,
    EnvironmentBestsellersFeed,
    SocietyBestsellersFeed,
    PoliticsBestsellersFeed,
    MusicFilmBestsellersFeed,
    SportBestsellersFeed,
    HomeGardenBestsellersFeed,
    FoodDrinkBestsellersFeed
  )

  override def adsTargetedAt(segment: Segment): Seq[Book] = super.adsTargetedAt(segment).sortBy(_.position)

  override def defaultAds: Seq[Book] = currentAds filter (_.category.exists(_ == "General"))

  def refresh() {

    def takeFromEachList(allBooks: Seq[Seq[Book]], n: Int): Seq[Seq[Book]] = {
      for (books <- allBooks) yield books take n
    }

    val bookListsLoading = Future.sequence {
      feeds.foldLeft(Seq[Future[Seq[Book]]]()) {
        (soFar, feed) =>
          soFar :+ feed.loadAds().recover {
            case _ => Nil
          }
      }
    }

    for (books <- bookListsLoading) {
      updateCurrentAds(takeFromEachList(books, 5).flatten)
    }
  }
}
