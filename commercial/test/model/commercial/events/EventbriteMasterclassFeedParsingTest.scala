package model.commercial.events

import model.commercial.events.Eventbrite.EBResponse
import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.json._

class EventbriteMasterclassFeedParsingTest extends FlatSpec with Matchers {

  "MasterClassFeedParser" should "parse out a list of Event JsValues" in {
    val eventBriteFeed: JsValue = Json.parse(Fixtures.rawEventBriteFeed)
    val response = eventBriteFeed.as[EBResponse]

    response.pagination.pageCount should be (2)
    response.pagination.pageNumber should be (1)

    response.events.size should be (50)

    val singleMasterclass = Masterclass(response.events.filter(_.name == "Self-editing skills for novelists").head).get
    singleMasterclass.tickets.size should be (2)
  }
}
