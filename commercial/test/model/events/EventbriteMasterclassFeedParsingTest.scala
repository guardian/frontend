package commercial.model.merchandise.events

import commercial.model.merchandise.Masterclass
import commercial.model.merchandise.events.Eventbrite.Response
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.json._

class EventbriteMasterclassFeedParsingTest extends AnyFlatSpec with Matchers {

  "MasterClassFeedParser" should "parse out a list of Event JsValues" in {
    val eventBriteFeed: JsValue = Json.parse(Fixtures.rawEventBriteFeed)
    val response = eventBriteFeed.as[Response]

    response.pagination.pageCount should be(2)
    response.pagination.pageNumber should be(1)

    response.events.size should be(50)

    val singleMasterclass =
      Masterclass.fromEvent(response.events.filter(_.name == "Self-editing skills for novelists").head).get
    singleMasterclass.tickets.size should be(2)
  }
}
