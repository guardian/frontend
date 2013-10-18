package model.commercial.travel

import org.scalatest.Matchers
import org.scalatest.FlatSpec

class OffersAgentTest extends FlatSpec with Matchers {

  "offers" should "give offers associated with given keywords" in {
    val keywords = List("france")
    val allOffers = Fixtures.offers

    val offers = OffersAgent.offers(keywords, allOffers)

    offers should be(List(Fixtures.offers(2)))
  }

  "offers" should "give empty list when no offers associated with given keywords" in {
    val keywords = List("argentina")
    val allOffers = Fixtures.offers

    val offers = OffersAgent.offers(keywords, allOffers)

    offers should be(Nil)
  }

  "offers" should "give empty list when no offers" in {
    val keywords = List("france")
    val allOffers = Nil

    val offers = OffersAgent.offers(keywords, allOffers)

    offers should be(Nil)
  }

}
