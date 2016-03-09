package model.commercial.events

import java.lang.System._

import commercial.feeds.{FeedMetaData, MissingFeedException, ParsedFeed, SwitchOffException}
import common.{ExecutionContexts, Logging}
import org.joda.time.DateTime.now
import play.api.libs.json._

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.control.NonFatal

object EventbriteApi extends ExecutionContexts with Logging {

  def parsePageOfEvents(json: JsValue): Seq[Event] = {

    val events: Seq[Event] = (json \ "events").as[Seq[Event]]
    events.filter(_.startDate.isAfter(now.plusWeeks(2)))
  }

  def parseEvents(feedMetaData: FeedMetaData, feedContent: => Option[String]): Future[ParsedFeed[Event]] = {

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
}
