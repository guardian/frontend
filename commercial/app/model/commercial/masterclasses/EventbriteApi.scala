package model.commercial.masterclasses

import java.lang.System._

import commercial.feeds.{FeedMetaData, MissingFeedException, ParsedFeed, SwitchOffException}
import common.{ExecutionContexts, Logging}
import org.joda.time.DateTime.now
import play.api.libs.json.{JsArray, JsValue, Json}

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.control.NonFatal

object EventbriteApi extends ExecutionContexts with Logging {

  def extractEventsFromFeed(jsValue: JsValue): Seq[JsValue] = {
    val maybeEvents = for (JsArray(events) <- (jsValue \ "events").toOption) yield events
    maybeEvents getOrElse Nil
  }

  def parseEvents(
    feedMetaData: FeedMetaData,
    feedContent: => Option[String]
  ): Future[ParsedFeed[EventbriteMasterClass]] = {
    feedMetaData.switch.isGuaranteedSwitchedOn flatMap { switchedOn =>
      if (switchedOn) {
        val start = currentTimeMillis
        feedContent map { body =>
          val JsArray(pages) = Json.parse(body).as[JsArray]
          Future(ParsedFeed(
            pages flatMap parsePageOfEvents,
            Duration(currentTimeMillis - start, MILLISECONDS))
          )
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

  def parsePageOfEvents(json: JsValue): Seq[EventbriteMasterClass] = {
    for {
      jsValue <- extractEventsFromFeed(json)
      masterclass <- EventbriteMasterClass(jsValue)
      if masterclass.startDate.isAfter(now.plusWeeks(2))
    } yield masterclass
  }
}
