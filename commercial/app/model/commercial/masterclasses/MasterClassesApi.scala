package model.commercial.masterclasses

import play.api.libs.json.JsValue
import conf.{Switches, CommercialConfiguration}
import model.commercial.JsonAdsApi

object MasterClassesApi extends JsonAdsApi[MasterClass] {

  protected val switch = Switches.MasterclassFeedSwitch

  lazy val organiserId = "684756979"
  lazy val apiKeyOption = CommercialConfiguration.getProperty("masterclasses.api.key")

  val adTypeName = "Masterclasses"

  protected val url: Option[String] = {
    apiKeyOption map (apiKey => s"https://www.eventbrite.com/json/organizer_list_events?app_key=$apiKey&id=$organiserId")
  }

  override protected val characterEncoding = "utf-8"

  override protected val loadTimeout = 30000

  def extractEventsFromFeed(jsValue: JsValue) = jsValue \\ "event"

  def parse(json: JsValue) = {
    val maybes = extractEventsFromFeed(json) map (MasterClass(_))
    maybes.flatten
  }
}
