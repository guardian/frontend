package model.commercial.masterclasses

import common.ExecutionContexts
import play.api.libs.ws.WS
import play.api.libs.json.{JsNull, JsValue}
import scala.concurrent.Future
import conf.CommercialConfiguration

object MasterClassesApi extends ExecutionContexts {
  lazy val apiId = "3497465071"
  lazy val apiKeyOption = CommercialConfiguration.masterclasses.apiKey

  def extractEventsFromFeed(jsValue: JsValue) = jsValue \\ "event"

  def getAll: Future[Seq[MasterClass]] = {
    getMasterClassJson map {
      eventBriteJson =>
        val maybes: Seq[Option[MasterClass]] = extractEventsFromFeed(eventBriteJson) map (MasterClass(_))
        maybes.flatten
    }
  }

  def getMasterClassJson: Future[JsValue] = {
    if (apiKeyOption.isDefined) {
      val apiKey = apiKeyOption.get
      WS.url(s"https://www.eventbrite.com/json/organizer_list_events?app_key=$apiKey&id=$apiId")
        .withHeaders(("Cache-Control", "public, max-age=1"))
        .withRequestTimeout(20000)
        .get()
        .map {
        response => response.json
      }
    } else {
      Future(JsNull)
    }
  }
}
