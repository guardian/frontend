package commercial.model.merchandise.travel

import java.lang.System.currentTimeMillis

import commercial.model.feeds.{FeedMetaData, MissingFeedException, ParsedFeed, SwitchOffException}
import common.GuLogging
import commercial.model.merchandise.TravelOffer
import org.joda.time.format.DateTimeFormat

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import scala.util.control.NonFatal
import scala.xml.{Elem, XML}

object TravelOffersApi extends GuLogging {

  private val dateFormat = DateTimeFormat.forPattern("dd-MMM-yyyy")

  def parse(xml: Elem): Seq[TravelOffer] = (xml \\ "product") map TravelOffer.fromXml

  def parseOffers(feedMetaData: FeedMetaData, feedContent: => Option[String])(implicit
      executionContext: ExecutionContext,
  ): Future[ParsedFeed[TravelOffer]] = {
    val start = System.currentTimeMillis
    feedContent map { body =>
      val elems = XML.loadString(body)
      val parsed = parse(elems)
      Future(ParsedFeed(parsed, Duration(currentTimeMillis - start, MILLISECONDS)))
    } getOrElse {
      Future.failed(MissingFeedException(feedMetaData.name))
    }
  }
}
