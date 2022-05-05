package commercial.model.merchandise.events

import commercial.model.merchandise.Masterclass
import commercial.model.merchandise.events.Eventbrite.{Event, Venue}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.OptionValues
import play.api.libs.json._

class SingleEventbriteMasterclassParsingTest extends AnyFlatSpec with Matchers with OptionValues {

  "MasterClass companion object" should
    "not create a masterclass object if there isn't at link to the Guardian with the words 'Click here'" in {
    val event = Json.parse(Fixtures.jsonWithNoLink).as[Event]
    Masterclass.fromEvent(event) shouldBe 'empty
  }

  "MasterClass companion object" should "return an appropriate MasterClass" in {
    val masterclass = Masterclass.fromEvent(Json.parse(Fixtures.json).as[Event]).get

    masterclass.name should be("Travel writing weekend")
    masterclass shouldBe 'open
    masterclass.displayPriceRange should be(Some("£400.00"))
    masterclass.ratioTicketsLeft should be(Some(0.5))
    masterclass.guardianUrl should be(
      "http://www.theguardian.com/guardian-masterclasses/how-to-use-twitter-effectively-david-schneider-david-levin-social-media-course",
    )
    masterclass.readableDate should be("20 April 2013")
    masterclass.capacity should be(18)
    masterclass.url should be("https://www.eventurl.com")
    masterclass.venue should be {
      Venue(
        Some("The Guardian"),
        Some("Kings Place"),
        Some("90 York Way"),
        Some("London"),
        Some("United Kingdom"),
        Some("N1 9GU"),
      )
    }
    masterclass.venue.description should be("The Guardian, London")
  }

  "MasterClass companion object" should "handle classes with 2 tickets as a range" in {
    val masterclass = Masterclass.fromEvent(Json.parse(Fixtures.jsonWith2Tickets).as[Event]).get

    masterclass.name should be("Travel writing weekend")
    masterclass shouldBe 'open
    masterclass.displayPriceRange should be(Some("£400.00 to £2,600.00"))
    masterclass.ratioTicketsLeft should be(Some(0.5))
  }

  "Generated masterclass object" should "have a description text that is truncated to 250 chars" in {
    val masterclass = Masterclass.fromEvent(Json.parse(Fixtures.json).as[Event]).get

    masterclass.name should be("Travel writing weekend")
  }

  "apply" should "produce a masterclass with one price if its second price is not visible" in {
    val masterclass = Masterclass.fromEvent(Json.parse(Fixtures.jsonWithInvisiblePrice).as[Event]).get
    masterclass.tickets should have length 1
  }
}
