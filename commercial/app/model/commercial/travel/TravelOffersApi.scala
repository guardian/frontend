package model.commercial.travel

import java.lang.System.currentTimeMillis

import commercial.feeds.{FeedMetaData, MissingFeedException, ParsedFeed, SwitchOffException}
import common.{ExecutionContexts, Logging}
import org.joda.time.format.DateTimeFormat

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.control.NonFatal
import scala.xml.{Elem, Node, XML}

object TravelOffersApi extends ExecutionContexts with Logging {

  private val dateFormat = DateTimeFormat.forPattern("dd-MMM-yyyy")

  private def buildOffer(node: Node): TravelOffer = {

    def textValue(nodeName: String): String = (node \ nodeName).text.trim()

    def textValues(nodeName: String): List[String] = (node \ nodeName).map(_.text.trim()).toList

    TravelOffer(
      textValue("prodId").toInt,
      textValue("prodName"),
      textValue("prodUrl"),
      textValue("prodImage"),
      textValue("@fromprice").replace(".00", ""),
      dateFormat.parseDateTime(textValue("@earliestdeparture")),
      Nil,
      textValues("location"),
      textValue("category"),
      textValues("tag"),
      textValue("@duration"),
      textValue("position").toInt
    )
  }

  def parse(xml: Elem): Seq[TravelOffer] = (xml \\ "offer") map buildOffer

  def parseOffers(feedMetaData: FeedMetaData, feedContent: => Option[String]): Future[ParsedFeed[TravelOffer]] = {
    feedMetaData.switch.isGuaranteedSwitchedOn flatMap { switchedOn =>
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
        Future.failed(SwitchOffException(feedMetaData.switch.name))
      }
    } recoverWith {
      case NonFatal(e) => Future.failed(e)
    }
  }
}
