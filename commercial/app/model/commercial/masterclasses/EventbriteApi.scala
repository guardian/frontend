package model.commercial.masterclasses

import common.ExecutionContexts
import conf.Switches.MasterclassFeedSwitch
import conf.{CommercialConfiguration, Configuration}
import model.commercial.{FeedReader, FeedRequest}
import play.api.libs.json.JsValue

import scala.concurrent.Future
import scala.concurrent.duration._

object EventbriteApi extends ExecutionContexts {

  lazy val organiserId = "684756979"
  lazy val apiKeyOption = CommercialConfiguration.getProperty("masterclasses.api.key")

  lazy val devUrl = CommercialConfiguration.getProperty("masterclasses.dev.url")

  protected val url: Option[String] = {
    val env = Configuration.environment
    if (env.isNonProd) devUrl
    else apiKeyOption map { apiKey =>
      s"https://www.eventbrite.com/json/organizer_list_events?app_key=$apiKey&id=$organiserId"
    }
  }

  def extractEventsFromFeed(jsValue: JsValue): Seq[JsValue] = jsValue \\ "event"

  def loadAds(): Future[Seq[EventbriteMasterClass]] = {
    val request = FeedRequest(
      feedName = "Masterclasses",
      switch = MasterclassFeedSwitch,
      url = url,
      timeout = 60.seconds,
      responseEncoding = Some("utf-8")
    )
    FeedReader.readSeqFromJson(request) { json =>
      val maybes = extractEventsFromFeed(json) map (EventbriteMasterClass(_))
      maybes.flatten
    }
  }

}
