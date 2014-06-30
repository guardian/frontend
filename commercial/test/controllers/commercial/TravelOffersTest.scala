package controllers.commercial

import play.api.test.Helpers._
import org.scalatest.Matchers
import org.scalatest.FlatSpec
import test.{Fake, TestRequest}

class TravelOffersTest extends FlatSpec with Matchers {

   "Travel Offers Controller" should "404 when an ad is requested where there are no matching offers" in Fake {
     val request = TestRequest().withFormUrlEncodedBody(("k","k1"))

     val result = controllers.commercial.TravelOffers.travelOffersLowHtml(request)

     status(result) should be(404)
   }

 }
