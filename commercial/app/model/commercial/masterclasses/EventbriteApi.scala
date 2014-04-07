package model.commercial.masterclasses

import play.api.libs.json.JsValue
import conf.{Switches, CommercialConfiguration}
import model.commercial.JsonAdsApi

object EventbriteApi extends JsonAdsApi[EventbriteMasterClass] {

  protected val switch = Switches.MasterclassFeedSwitch

  lazy val organiserId = "684756979"
  lazy val apiKeyOption = CommercialConfiguration.getProperty("masterclasses.api.key")

  val adTypeName = "Masterclasses"

  protected val url: Option[String] = {
    apiKeyOption map (apiKey => s"https://www.eventbrite.com/json/organizer_list_events?app_key=$apiKey&id=$organiserId")
  }

  override protected val characterEncoding = "utf-8"

  override protected val loadTimeout = 300000

  def extractEventsFromFeed(jsValue: JsValue): Seq[JsValue] = jsValue \\ "event"

  def parse(json: JsValue) = {
    val maybes = extractEventsFromFeed(json) map (EventbriteMasterClass(_))
    maybes.flatten
  }
}
