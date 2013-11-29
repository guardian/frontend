package model.commercial.travel

import org.scalatest.Matchers
import org.scalatest.FlatSpec
import model.commercial.{Context, Segment}
import scala.util.Try

class OffersAgentTest extends FlatSpec with Matchers {

  private def segment(keywords: Seq[String]) = Segment(Context(None, keywords), Seq("repeat"))

  "matchingAds" should "give offers associated with given keywords" in {
    val keywords = List("france")
    val allOffers = Fixtures.offers

    val offers = OffersAgent.adsTargetedAt(segment(keywords), allOffers)

    offers should be(List(Fixtures.offers(2)))
  }

  "matchingAds" should "give empty list when no offers associated with given keywords" in {
    val keywords = List("argentina")
    val allOffers = Fixtures.offers

    val offers = Try(OffersAgent.adsTargetedAt(segment(keywords), allOffers)).getOrElse(Nil)

    offers should be(Nil)
  }

  "matchingAds" should "give empty list when no offers" in {
    val keywords = List("france")
    val allOffers = Nil

    val offers = Try(OffersAgent.adsTargetedAt(segment(keywords), allOffers)).getOrElse(Nil)

    offers should be(Nil)
  }

}
