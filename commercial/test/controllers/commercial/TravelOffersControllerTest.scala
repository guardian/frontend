package controllers.commercial

import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._
import test.{ConfiguredTestSuite, TestRequest}

@DoNotDiscover class TravelOffersControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

   "Travel Offers Controller" should "404 when an ad is requested where there are no matching offers" in {
     val request = TestRequest().withFormUrlEncodedBody(("k","k1"))
     val travelOffersController = new TravelOffersController()
     val result = travelOffersController.renderTravel(request)

     status(result) should be(404)
   }

 }
