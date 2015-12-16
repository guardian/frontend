package model.commercial.masterclasses

import java.lang.System._

import commercial.feeds.{MissingFeedException, ParsedFeed, SwitchOffException}
import common.{ExecutionContexts, Logging}
import conf.Configuration.commercial.merchandisingFeedsLatest
import conf.switches.Switches
import org.joda.time.DateTime.now
import play.api.libs.json.{JsArray, JsValue, Json}
import services.S3

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.control.NonFatal

object EventbriteApi extends ExecutionContexts with Logging {

  private val feedName = "masterclasses"

  def extractEventsFromFeed(jsValue: JsValue): Seq[JsValue] = {
    val maybeEvents = for (JsArray(events) <- (jsValue \ "events").toOption) yield events
    maybeEvents getOrElse Nil
  }

  def parseEvents(): Future[ParsedFeed[EventbriteMasterClass]] = {
    Switches.MasterclassFeedSwitch.isGuaranteedSwitchedOn flatMap { switchedOn =>
      if (switchedOn) {
        val start = currentTimeMillis
        S3.get(s"$merchandisingFeedsLatest/$feedName") map { body =>
          val JsArray(pages) = Json.parse(body).as[JsArray]
          Future(ParsedFeed(
            pages flatMap parsePageOfEvents,
            Duration(currentTimeMillis - start, MILLISECONDS))
          )
        } getOrElse {
          Future.failed(MissingFeedException(feedName))
        }
      } else {
        Future.failed(SwitchOffException(Switches.JobFeedSwitch.name))
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
