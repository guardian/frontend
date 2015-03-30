package controllers.commercial

import play.api.test.Helpers._
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import test.{ConfiguredTestSuite, TestRequest}

@DoNotDiscover class TravelOffersTest extends FlatSpec with Matchers with ConfiguredTestSuite {

   "Travel Offers Controller" should "404 when an ad is requested where there are no matching offers" in {
     val request = TestRequest().withFormUrlEncodedBody(("k","k1"))

     val result = controllers.commercial.TravelOffers.renderTravel(request)

     status(result) should be(404)
   }

 }
