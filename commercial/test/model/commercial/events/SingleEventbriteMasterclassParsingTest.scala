package model.commercial.events

import model.commercial.events.Eventbrite._
import org.scalatest.{FlatSpec, Matchers, OptionValues}
import play.api.libs.json._

class SingleEventbriteMasterclassParsingTest extends FlatSpec with Matchers with OptionValues {

  "MasterClass companion object" should
    "not create a masterclass object if there isn't at link to the Guardian with the words 'Click here'" in {
    val event = Json.parse(Fixtures.jsonWithNoLink).as[EBEvent]
    Masterclass(event) shouldBe 'empty
  }

  "MasterClass companion object" should "return an appropriate MasterClass" in {
    val masterclass = Masterclass(Json.parse(Fixtures.json).as[EBEvent]).get

    masterclass.name should be("Travel writing weekend")
    masterclass shouldBe 'open
    masterclass.displayPrice should be ("£400.00")
    masterclass.ratioTicketsLeft should be (0.5)
    masterclass.guardianUrl should be ("http://www.theguardian.com/guardian-masterclasses/how-to-use-twitter-effectively-david-schneider-david-levin-social-media-course")
    masterclass.readableDate should be ("20 April 2013")
    masterclass.capacity should be (18)
    masterclass.url should be ("https://www.eventurl.com")
    masterclass.venue should be {
      EBVenue(None, Some("Kings Place"), Some("90 York Way"), Some("London"), Some("United Kingdom"), Some("N1 9GU"))
    }
    masterclass.venue.description should be("London")
  }

  "MasterClass companion object" should "handle classes with 2 tickets as a range" in {
    val masterclass = Masterclass(Json.parse(Fixtures.jsonWith2Tickets).as[EBEvent]).get

    masterclass.name should be("Travel writing weekend")
    masterclass shouldBe 'open
    masterclass.displayPrice should be ("£400.00 to £2,600.00")
    masterclass.ratioTicketsLeft should be (0.5)
  }

  "Generated masterclass object" should "have a description text that is truncated to 250 chars" in {
    val masterclass = Masterclass(Json.parse(Fixtures.json).as[EBEvent]).get

    masterclass.name should be("Travel writing weekend")
    masterclass.truncatedFirstParagraph should be ("Everybody loves a good, juicy murder. So it's little wonder crime fiction is one of the UK's bestselling literary genres. Whether your tastes tend toward the gritty Jack Reacher procedural or the witty Father Brown whimsical, over the course of a ...")
  }

  "apply" should "produce a masterclass with one price if its second price is not visible" in {
    val masterclass = Masterclass(Json.parse(Fixtures.jsonWithInvisiblePrice).as[EBEvent]).get
    masterclass.tickets should have length 1
  }
}
