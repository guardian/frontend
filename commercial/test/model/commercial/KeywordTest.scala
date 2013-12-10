package model.commercial

import org.scalatest.{Matchers, FlatSpec}

class KeywordTest extends FlatSpec with Matchers {

  "name" should "be transformed webTitle" in {
    val keyword = Keyword("travel/northandcentralamerica", "North and Central America")

    keyword.name should be("north-and-central-america")
  }

}
