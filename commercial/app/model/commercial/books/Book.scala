package model.commercial.books

import commercial.feeds.{FeedMetaData, ParsedFeed}
import common.ExecutionContexts
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
                keywordIdSuffixes: Seq[String] = Nil)

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

  private def stringOrDoubleAsDouble(value: String): Reads[Option[Double]] = {
    val path = JsPath \ value
    path.readNullable[Double] orElse path.readNullable[String].map(_.map(_.toDouble))
  }

  implicit val bookReads: Reads[Book] = (
    (JsPath \ "name").read[String] and
      authorReads and
      (JsPath \ "isbn").read[String] and
      stringOrDoubleAsDouble("regular_price_with_tax") and
      stringOrDoubleAsDouble("final_price_with_tax") and
      (JsPath \ "description").readNullable[String] and
      (JsPath \ "images")(0).readNullable[String] and
      (JsPath \ "product_url").readNullable[String] and
      (JsPath \ "guardian_bestseller_rank").readNullable[String].map(_.map(_.toDouble.toInt)) and
      ((JsPath \ "categories")(0) \ "name").readNullable[String] and
      (JsPath \ "keywordIds").readNullable[Seq[String]].map(_ getOrElse Nil)
    )(Book.apply _)
}


object BestsellersAgent extends MerchandiseAgent[Book] with ExecutionContexts {

  def getSpecificBook(isbn: String) = available find (_.isbn == isbn)

  def getSpecificBooks(isbns: Seq[String]): Future[Seq[Book]] = {
    Future.sequence {
      isbns map (BookFinder.findByIsbn(_))
    } map (_.flatten.sortBy(book => isbns.indexOf(book.isbn)))
  }

  def bestsellersTargetedAt(segment: Segment): Seq[Book] = {
    val targetedBestsellers = available filter { book =>
      Keyword.idSuffixesIntersect(segment.context.keywords, book.keywordIdSuffixes)
    }
    lazy val defaultBestsellers = available filter (_.category.contains("General"))
    val bestsellers = if (targetedBestsellers.isEmpty) defaultBestsellers else targetedBestsellers
    bestsellers.filter(_.jacketUrl.nonEmpty).sortBy(_.position).take(10)
  }

  def refresh(feedMetaData: FeedMetaData, feedContent: => Option[String]): Future[ParsedFeed[Book]] = {
    val parsedFeed = MagentoBestsellersFeed.loadBestsellers(feedMetaData, feedContent)

    for (feed <- parsedFeed) {
      updateAvailableMerchandise(feed.contents)
    }

    parsedFeed
  }
}
