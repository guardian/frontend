package model.commercial.travel

import java.lang.System.currentTimeMillis

import commercial.feeds.{FeedMetaData, MissingFeedException, ParsedFeed, SwitchOffException}
import common.{ExecutionContexts, Logging}
import org.joda.time.format.DateTimeFormat

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.control.NonFatal
import scala.xml.{Elem, XML}

object TravelOffersApi extends ExecutionContexts with Logging {

  private val dateFormat = DateTimeFormat.forPattern("dd-MMM-yyyy")

  def parse(xml: Elem): Seq[TravelOffer] = (xml \\ "product") map TravelOffer.fromXml

  def parseOffers(feedMetaData: FeedMetaData, feedContent: => Option[String]): Future[ParsedFeed[TravelOffer]] = {
    feedMetaData.parseSwitch.isGuaranteedSwitchedOn flatMap { switchedOn =>
      if (switchedOn) {
        val start = System.currentTimeMillis
        feedContent map { body =>
          val elems = XML.loadString(body)
          val parsed = parse(elems)
          Future(ParsedFeed(parsed, Duration(currentTimeMillis - start, MILLISECONDS)))
        } getOrElse {
          Future.failed(MissingFeedException(feedMetaData.name))
        }
      } else {
        Future.failed(SwitchOffException(feedMetaData.parseSwitch.name))
      }
    } recoverWith {
      case NonFatal(e) => Future.failed(e)
    }
  }
}
