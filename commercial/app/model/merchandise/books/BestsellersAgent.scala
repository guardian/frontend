package model.commercial.books

import commercial.feeds.{FeedMetaData, ParsedFeed}
import common.ExecutionContexts
import model.commercial._
import play.api.libs.functional.syntax._
import play.api.libs.json._
import play.api.libs.json.Reads._
import play.api.libs.json.{JsPath, Reads, Writes}

import scala.concurrent.Future

class BestsellersAgent(bookFinder: BookFinder) extends MerchandiseAgent[Book] with ExecutionContexts {

  def getSpecificBook(isbn: String) = available find (_.isbn == isbn)

  def getSpecificBooks(isbns: Seq[String]): Future[Seq[Book]] = {
    Future.sequence {
      isbns map (bookFinder.findByIsbn(_))
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
