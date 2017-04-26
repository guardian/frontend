package commercial.model.merchandise.books

import commercial.model.Segment
import commercial.model.capi.Keyword
import commercial.model.feeds.{FeedMetaData, ParsedFeed}
import common.ExecutionContexts
import commercial.model.merchandise.{Book, MerchandiseAgent}

import scala.concurrent.Future

class BestsellersAgent(bookFinder: BookFinder) extends MerchandiseAgent[Book] with ExecutionContexts {

  def getSpecificBook(isbn: String) = available find (_.isbn == isbn)

  def getSpecificBooks(isbns: Seq[String]): Seq[Book] =
    (isbns flatMap bookFinder.findByIsbn).sortBy(book => isbns.indexOf(book.isbn))

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
