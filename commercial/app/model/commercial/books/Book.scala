package model.commercial.books

import common.{ExecutionContexts, AkkaAgent}
import conf.Switches.MagentoServiceSwitch
import model.commercial._
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json.{JsPath, Reads}

import scala.concurrent.Future


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
                keywordIds: Seq[String] = Nil
               )
  extends Ad {

  def isTargetedAt(segment: Segment): Boolean = intersects(lastPart(keywordIds), segment.context.keywords)
}

object Book {

  private val authorReads = {
    ((JsPath \ "author_firstname").readNullable[String] and
      (JsPath \ "author_lastname").readNullable[String])
      .tupled.map { case (optFirstName, optLastName) =>
      for {
        firstName <- optFirstName
        lastName <- optLastName
      } yield s"$firstName $lastName"
    }
  }

  implicit val bookReads: Reads[Book] = (
    (JsPath \ "name").read[String] and
      authorReads and
      (JsPath \ "isbn").read[String] and
      (JsPath \ "regular_price_with_tax").readNullable[String].map(_.map(_.toDouble)) and
      (JsPath \ "final_price_with_tax").readNullable[Double] and
      (JsPath \ "description").readNullable[String] and
      (JsPath \ "images")(0).readNullable[String] and
      (JsPath \ "product_url").readNullable[String] and
      (JsPath \ "guardian_bestseller_rank").readNullable[String].map(_.map(_.toDouble.toInt)) and
      ((JsPath \ "categories")(0) \ "name").readNullable[String] and
      (JsPath \ "keywordIds").readNullable[Seq[String]].map(_ getOrElse Nil)
    )(Book.apply _)
}


object BestsellersAgent extends ExecutionContexts {

  private lazy val agent = AkkaAgent[Seq[Book]](Nil)

  private val bertramFeeds = Seq(
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

  private val magentoFeeds = Seq(MagentoBestsellersFeed)

  def getSpecificBook(isbn: String) = agent() find (_.isbn == isbn)
  def getSpecificBooks(specifics: Seq[String]) = agent() filter (specifics contains _.isbn)

  def bestsellersTargetedAt(segment: Segment): Seq[Book] = {
    val targetedBestsellers = agent() filter (_.isTargetedAt(segment))
    lazy val defaultBestsellers = agent() filter (_.category.exists(_ == "General"))
    val bestsellers = if (targetedBestsellers.isEmpty) defaultBestsellers else targetedBestsellers
    bestsellers.sortBy(_.position).take(10)
  }

  def refresh() {

    val bookListsLoading: Future[Seq[Seq[Book]]] = Future.sequence {
      val feeds = if (MagentoServiceSwitch.isSwitchedOn) magentoFeeds else bertramFeeds

      feeds.foldLeft(Seq[Future[Seq[Book]]]()) {
        (soFar, feed) =>
          soFar :+ feed.loadBestsellers().recover {
            case _ => Nil
          }
      }
    }

    for (books <- bookListsLoading) {
      MerchandiseAgent.updateAvailableMerchandise(agent, books.flatten.distinct)
    }
  }

}
