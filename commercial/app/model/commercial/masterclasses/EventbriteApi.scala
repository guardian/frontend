package model.commercial.masterclasses

import common.{ExecutionContexts, Logging}
import conf.CommercialConfiguration
import conf.Switches.MasterclassFeedSwitch
import model.commercial.{FeedMissingConfigurationException, FeedReader, FeedRequest}
import org.joda.time.DateTime.now
import play.api.libs.json.{JsArray, JsValue}

import scala.concurrent.Future
import scala.concurrent.duration._

object EventbriteApi extends ExecutionContexts with Logging {

  private lazy val maybeUrl: Option[String] = {
    for (token <- CommercialConfiguration.getProperty("eventbrite.token")) yield {
      val queryString = s"token=$token&order_by=start_desc&expand=ticket_classes,venue&page=2"
      s"https://www.eventbriteapi.com/v3/users/me/owned_events/?$queryString"
    }
  }

  def extractEventsFromFeed(jsValue: JsValue): Seq[JsValue] = {
    val maybeEvents = for (JsArray(events) <- (jsValue \ "events").toOption) yield events
    maybeEvents getOrElse Nil
  }

  def loadEvents(): Future[Seq[EventbriteMasterClass]] = {
    maybeUrl map { url =>
      val request = FeedRequest(
        feedName = "Masterclasses",
        switch = MasterclassFeedSwitch,
        url,
        timeout = 60.seconds,
        responseEncoding = Some("utf-8"))
      FeedReader.readSeqFromJson(request) { json =>
        for {
          jsValue <- extractEventsFromFeed(json)
          masterclass <- EventbriteMasterClass(jsValue)
          if masterclass.startDate.isAfter(now.plusWeeks(2))
        } yield masterclass
      }
    } getOrElse {
      log.warn(s"Missing URL for Masterclasses feed")
      Future.failed(FeedMissingConfigurationException("Masterclasses"))
    }
  }

}
