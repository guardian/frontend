package model.commercial

import org.scalatest.{Matchers, FlatSpec}
import scala.concurrent.Await
import scala.concurrent.duration._
import test.Fake
import model.commercial.masterclasses.MasterClassAgent

class KeywordTest extends FlatSpec with Matchers {

  "name" should "be transformed webTitle" in {
    val keyword = Keyword("travel/northandcentralamerica", "North and Central America")

    keyword.name should be("north-and-central-america")
  }

  "lookup" should "find expected results using elastic search content API client" in Fake {
    MasterClassAgent.stop()

    val keywords = Await.result(Lookup.keyword("Leisure"), atMost = 1.seconds)

    keywords.map(_.id) should contain allOf(
      "books/sportandleisure",
      "music/the-leisure-society",
      "business/travelleisure",
      "theobserver/savemoney/shoppingleisure"
      )

  }

  "lookup" should "ignore section filter when using elastic search content API client" in Fake {
    MasterClassAgent.stop()

    val keywords = Await.result(Lookup.keyword("France", section = Some("travel")), atMost = 10.seconds)

    keywords.size should be >= 2
  }

}
