package controllers.commercial

import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import test.{Fake, TestRequest}

class TravelOffersTest extends FlatSpec with ShouldMatchers {

   "Travel Offers Controller" should "200 when an ad is requested where there are no matching offers" in Fake {
     val request = TestRequest().withFormUrlEncodedBody(("k","k1"))

     val result = controllers.commercial.TravelOffers.listOffers(request)

     status(result) should be(200)
   }

 }
