package commercial.model.merchandise.books

import commercial.model.Segment
import commercial.model.capi.Keyword
import commercial.model.feeds.{FeedMetaData, ParsedFeed}
import commercial.model.merchandise.{Book, MerchandiseAgent}

import scala.concurrent.{ExecutionContext, Future}

class BestsellersAgent(bookFinder: BookFinder) extends MerchandiseAgent[Book] {

  def getSpecificBook(isbn: String): Option[Book] = available find (_.isbn == isbn)

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

  def refresh(feedMetaData: FeedMetaData, feedContent: => Option[String])(implicit
      executionContext: ExecutionContext,
  ): Future[ParsedFeed[Book]] = {
    val parsedFeed = MagentoBestsellersFeed.loadBestsellers(feedMetaData, feedContent)

    for (feed <- parsedFeed) {
      updateAvailableMerchandise(feed.contents)
    }

    parsedFeed
  }
}
