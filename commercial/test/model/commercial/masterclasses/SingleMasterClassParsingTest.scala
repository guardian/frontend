package model.commercial.masterclasses

import org.scalatest.Matchers
import org.scalatest.FlatSpec
import play.api.libs.json._
import org.jsoup.nodes.{Element, Document}


class SingleMasterClassParsingTest extends FlatSpec with Matchers {
  "MasterClass companion object" should
    "not create a masterclass object if there isn't at link to the Guardian with the words 'Click here'" in {
    val event: JsValue = Json.parse(jsonWithNoLink)

    val resultMaybe = MasterClass(event)

    resultMaybe.isDefined should be (false)
  }

  "MasterClass companion object" should "return an appropriate MasterClass" in {
    val event: JsValue = Json.parse(json)

    val resultOption = MasterClass(event)

    resultOption.isDefined should be (true)
    val result = resultOption.get

    result.name should be("Travel writing weekend")
    result.isOpen should be (true)
    result.displayPrice should be ("400.00")
    result.guardianUrl should be ("http://www.theguardian.com/guardian-masterclasses/how-to-use-twitter-effectively-david-schneider-david-levin-social-media-course")


    result.capacity should be (18)
    result.url should be ("https://www.eventurl.com")
  }

  "MasterClass companion object" should "handle classes with 2 tickets as a range" in {
    val event: JsValue = Json.parse(jsonWith2Tickets)

    val resultMaybe = MasterClass(event)

    resultMaybe.isDefined should be (true)
    val result = resultMaybe.get

    result.name should be("Travel writing weekend")
    result.isOpen should be (true)
    result.displayPrice should be ("400.00 to 600.00")
  }


  val json = """{ "background_color" : "FFFFFF",
               |  "box_background_color" : "FFFFFF",
               |  "box_border_color" : "D5D5D3",
               |  "box_header_background_color" : "EFEFEF",
               |  "box_header_text_color" : "005580",
               |  "box_text_color" : "000000",
               |  "capacity" : 18,
               |  "category" : "seminars,conferences",
               |  "created" : "2013-02-15 09:50:35",
               |  "description" : "<P>A bunch of HTML goes here. <a href='http://www.theguardian.com/guardian-masterclasses/how-to-use-twitter-effectively-david-schneider-david-levin-social-media-course'>Full course and returns information on the Masterclasses website</a></P>",
               |  "end_date" : "2013-04-21 17:00:00",
               |  "id" : 112342566,
               |  "link_color" : "EE6600",
               |  "locale" : "en",
               |  "logo" : "http://logologo.jpg",
               |  "logo_ssl" : "https://logologo.jpg",
               |  "modified" : "2013-04-26 03:23:31",
               |  "num_attendee_rows" : 18.0,
               |  "organizer" : { "description" : "",
               |      "id" : 3497465071,
               |      "long_description" : "",
               |      "name" : "",
               |      "url" : "http://www.eventbrite.com/org/3497465071"
               |    },
               |  "privacy" : "Public",
               |  "repeats" : "no",
               |  "start_date" : "2013-04-20 10:00:00",
               |  "status" : "Live",
               |  "tags" : "travel, travel writing, masterclasses, short course, ",
               |  "text_color" : "005580",
               |  "tickets" : [ { "ticket" : { "currency" : "GBP",
               |            "description" : "",
               |            "display_price" : "400.00",
               |            "end_date" : "2013-04-20 09:30:00",
               |            "id" : 12319,
               |            "max" : 36,
               |            "min" : 1,
               |            "name" : "Travel writing weekend",
               |            "price" : "400.00",
               |            "start_date" : "2013-02-15 12:20:00",
               |            "type" : 0,
               |            "visible" : "true"
               |          } } ],
               |  "timezone" : "Europe/London",
               |  "timezone_offset" : "GMT+0100",
               |  "title" : "Travel writing weekend",
               |  "title_text_color" : "",
               |  "url" : "https://www.eventurl.com",
               |  "venue" : { "Lat-Long" : "51.534909 / -0.121693",
               |      "address" : "Kings Place",
               |      "address_2" : "90 York Way",
               |      "city" : "London",
               |      "country" : "United Kingdom",
               |      "country_code" : "GB",
               |      "id" : 645187,
               |      "latitude" : 51.534908999999999,
               |      "longitude" : -0.121693,
               |      "name" : "",
               |      "postal_code" : "N1 9GU",
               |      "region" : ""
               |    }
               |}""".stripMargin('|')


  val jsonWith2Tickets = """{ "background_color" : "FFFFFF",
               |  "box_background_color" : "FFFFFF",
               |  "box_border_color" : "D5D5D3",
               |  "box_header_background_color" : "EFEFEF",
               |  "box_header_text_color" : "005580",
               |  "box_text_color" : "000000",
               |  "capacity" : 18,
               |  "category" : "seminars,conferences",
               |  "created" : "2013-02-15 09:50:35",
               |  "description" : "<P>A bunch of HTML goes here. <a href='http://www.theguardian.com/guardian-masterclasses/how-to-use-twitter-effectively-david-schneider-david-levin-social-media-course'>Full course and returns information on the Masterclasses website</a></P>",
               |  "end_date" : "2013-04-21 17:00:00",
               |  "id" : 112342566,
               |  "link_color" : "EE6600",
               |  "locale" : "en",
               |  "logo" : "http://logologo.jpg",
               |  "logo_ssl" : "https://logologo.jpg",
               |  "modified" : "2013-04-26 03:23:31",
               |  "num_attendee_rows" : 18.0,
               |  "organizer" : { "description" : "",
               |      "id" : 3497465071,
               |      "long_description" : "",
               |      "name" : "",
               |      "url" : "http://www.eventbrite.com/org/3497465071"
               |    },
               |  "privacy" : "Public",
               |  "repeats" : "no",
               |  "start_date" : "2013-04-20 10:00:00",
               |  "status" : "Live",
               |  "tags" : "travel, travel writing, masterclasses, short course, ",
               |  "text_color" : "005580",
               |  "tickets" : [ { "ticket" : { "currency" : "GBP",
               |            "description" : "",
               |            "display_price" : "400.00",
               |            "end_date" : "2013-04-20 09:30:00",
               |            "id" : 12319,
               |            "max" : 36,
               |            "min" : 1,
               |            "name" : "Travel writing weekend",
               |            "price" : "400.00",
               |            "start_date" : "2013-02-15 12:20:00",
               |            "type" : 0,
               |            "visible" : "true"
               |          } }, { "ticket" : { "currency" : "GBP",
               |            "description" : "",
               |            "display_price" : "600.00",
               |            "end_date" : "2013-04-20 09:30:00",
               |            "id" : 12319,
               |            "max" : 36,
               |            "min" : 1,
               |            "name" : "Travel writing weekend ticket b",
               |            "price" : "400.00",
               |            "start_date" : "2013-02-15 12:20:00",
               |            "type" : 0,
               |            "visible" : "true"
               |          } } ],
               |  "timezone" : "Europe/London",
               |  "timezone_offset" : "GMT+0100",
               |  "title" : "Travel writing weekend",
               |  "title_text_color" : "",
               |  "url" : "https://www.eventurl.com",
               |  "venue" : { "Lat-Long" : "51.534909 / -0.121693",
               |      "address" : "Kings Place",
               |      "address_2" : "90 York Way",
               |      "city" : "London",
               |      "country" : "United Kingdom",
               |      "country_code" : "GB",
               |      "id" : 645187,
               |      "latitude" : 51.534908999999999,
               |      "longitude" : -0.121693,
               |      "name" : "",
               |      "postal_code" : "N1 9GU",
               |      "region" : ""
               |    }
               |}""".stripMargin('|')

  val jsonWithNoLink = """{ "background_color" : "FFFFFF",
               |  "box_background_color" : "FFFFFF",
               |  "box_border_color" : "D5D5D3",
               |  "box_header_background_color" : "EFEFEF",
               |  "box_header_text_color" : "005580",
               |  "box_text_color" : "000000",
               |  "capacity" : 18,
               |  "category" : "seminars,conferences",
               |  "created" : "2013-02-15 09:50:35",
               |  "description" : "<P>A bunch of HTML goes here. <a href='http://www.theguardian.com/contactus'>Contact the Guardian</a></P>",
               |  "end_date" : "2013-04-21 17:00:00",
               |  "id" : 112342566,
               |  "link_color" : "EE6600",
               |  "locale" : "en",
               |  "logo" : "http://logologo.jpg",
               |  "logo_ssl" : "https://logologo.jpg",
               |  "modified" : "2013-04-26 03:23:31",
               |  "num_attendee_rows" : 18.0,
               |  "organizer" : { "description" : "",
               |      "id" : 3497465071,
               |      "long_description" : "",
               |      "name" : "",
               |      "url" : "http://www.eventbrite.com/org/3497465071"
               |    },
               |  "privacy" : "Public",
               |  "repeats" : "no",
               |  "start_date" : "2013-04-20 10:00:00",
               |  "status" : "Live",
               |  "tags" : "travel, travel writing, masterclasses, short course, ",
               |  "text_color" : "005580",
               |  "tickets" : [ { "ticket" : { "currency" : "GBP",
               |            "description" : "",
               |            "display_price" : "400.00",
               |            "end_date" : "2013-04-20 09:30:00",
               |            "id" : 12319,
               |            "max" : 36,
               |            "min" : 1,
               |            "name" : "Travel writing weekend",
               |            "price" : "400.00",
               |            "start_date" : "2013-02-15 12:20:00",
               |            "type" : 0,
               |            "visible" : "true"
               |          } } ],
               |  "timezone" : "Europe/London",
               |  "timezone_offset" : "GMT+0100",
               |  "title" : "Travel writing weekend",
               |  "title_text_color" : "",
               |  "url" : "https://www.eventurl.com",
               |  "venue" : { "Lat-Long" : "51.534909 / -0.121693",
               |      "address" : "Kings Place",
               |      "address_2" : "90 York Way",
               |      "city" : "London",
               |      "country" : "United Kingdom",
               |      "country_code" : "GB",
               |      "id" : 645187,
               |      "latitude" : 51.534908999999999,
               |      "longitude" : -0.121693,
               |      "name" : "",
               |      "postal_code" : "N1 9GU",
               |      "region" : ""
               |    }
               |}""".stripMargin('|')
}
