package model.commercial

import org.scalatest.{Matchers, FlatSpec}
import common.UsesElasticSearch
import scala.concurrent.Await
import scala.concurrent.duration._
import conf.ContentApi
import test.Fake

class KeywordTest extends FlatSpec with Matchers with UsesElasticSearch {

  "name" should "be transformed webTitle" in {
    val keyword = Keyword("travel/northandcentralamerica", "North and Central America")

    keyword.name should be("north-and-central-america")
  }

  "lookup" should "find expected results using elastic search content API client" in Fake {
    val keywords = Await.result(Keyword.lookup("Leisure"), atMost = 1.seconds)

    keywords.map(_.id) should contain allOf(
      "books/sportandleisure",
      "music/the-leisure-society",
      "business/travelleisure",
      "theobserver/savemoney/shoppingleisure"
      )
  }

  "lookup" should "ignore section filter when using elastic search content API client" in Fake {
    val keywords = Await.result(Keyword.lookup("France", section = Some("travel")), atMost = 10.seconds)

    keywords.size should be >= 2
  }

  "lookup" should "find expected results using Solr content API client" in Fake {
    implicit val contentApi = ContentApi
    val keywords = Await.result(Keyword.lookup("France", section = Some("travel")), atMost = 10.seconds)

    keywords.map(_.id) should contain allOf("travel/france", "travel/frenchguiana")
  }
}
