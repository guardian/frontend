package model.commercial.masterclasses

import common.ExecutionContexts
import play.api.libs.ws.WS
import play.api.libs.json.JsValue
import scala.concurrent.Future
import conf.CommercialConfiguration

object MasterclassesApi extends ExecutionContexts {
  val apiId = CommercialConfiguration.masterclasses.apiId
  val apiKey = CommercialConfiguration.masterclasses.apiKey

  def getAll = getMasterClassJson map {
    eventBriteJson =>
      val events = eventBriteJson \\ "events"
      events map (MasterClass(_))

  }

  def getMasterClassJson: Future[JsValue] = {
    WS.url(s"https://www.eventbrite.com/json/organizer_list_events?app_key=$apiKey&id=$apiId")
      .withHeaders(("Cache-Control", "public, max-age=1"))
      .withRequestTimeout(20000)
      .get()
      .map {
      response => response.json
    }
  }
}
