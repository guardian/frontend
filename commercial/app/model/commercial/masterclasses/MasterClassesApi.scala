package model.commercial.masterclasses

import play.api.libs.json.JsValue
import scala.concurrent.Future
import conf.CommercialConfiguration
import model.commercial.JsonAdsApi

object MasterClassesApi extends JsonAdsApi[MasterClass] {

  lazy val organiserId = "684756979"
  lazy val apiKeyOption = CommercialConfiguration.getProperty("masterclasses.api.key")

  val adTypeName = "Masterclasses"

  override protected val characterEncoding = "utf-8"

  override protected val loadTimeout = 30000

  def extractEventsFromFeed(jsValue: JsValue) = jsValue \\ "event"

  def parse(json: JsValue) = {
    val maybes = extractEventsFromFeed(json) map (MasterClass(_))
    maybes.flatten
  }

  def getAll: Future[Seq[MasterClass]] = loadAds {
    apiKeyOption map (apiKey => s"https://www.eventbrite.com/json/organizer_list_events?app_key=$apiKey&id=$organiserId")
  }
}
