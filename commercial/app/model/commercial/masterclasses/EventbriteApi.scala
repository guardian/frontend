package model.commercial.masterclasses

import play.api.libs.json.JsValue
import conf.{Configuration, Switches, CommercialConfiguration}
import model.commercial.JsonAdsApi

object EventbriteApi extends JsonAdsApi[EventbriteMasterClass] {

  protected val adTypeName = "Masterclasses"

  protected val switch = Switches.MasterclassFeedSwitch

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

  override protected val characterEncoding = "utf-8"

  override protected val loadTimeout = 60000

  def extractEventsFromFeed(jsValue: JsValue): Seq[JsValue] = jsValue \\ "event"

  def parse(json: JsValue) = {
    val maybes = extractEventsFromFeed(json) map (EventbriteMasterClass(_))
    maybes.flatten
  }
}
