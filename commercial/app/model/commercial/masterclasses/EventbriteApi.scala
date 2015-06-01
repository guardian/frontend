package model.commercial.masterclasses

import common.{ExecutionContexts, Logging}
import conf.Switches.MasterclassFeedSwitch
import conf.{CommercialConfiguration, Configuration}
import model.commercial.{FeedMissingConfigurationException, FeedReader, FeedRequest}
import org.joda.time.DateTime.now
import play.api.libs.json.JsValue

import scala.concurrent.Future
import scala.concurrent.duration._

object EventbriteApi extends ExecutionContexts with Logging {

  lazy val organiserId = "684756979"
  lazy val apiKeyOption = CommercialConfiguration.getProperty("masterclasses.api.key")

  lazy val devUrl = CommercialConfiguration.getProperty("masterclasses.dev.url")

  private val maybeUrl: Option[String] = {
    val env = Configuration.environment
    if (env.isNonProd) devUrl
    else apiKeyOption map { apiKey =>
      s"https://www.eventbrite.com/json/organizer_list_events?app_key=$apiKey&id=$organiserId"
    }
  }

  def extractEventsFromFeed(jsValue: JsValue): Seq[JsValue] = jsValue \\ "event"

  def loadAds(): Future[Seq[EventbriteMasterClass]] = {
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
