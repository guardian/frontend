package commercial.controllers

import commercial.model.merchandise.travel.TravelOffersAgent
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._
import test._

@DoNotDiscover class TravelOffersControllerTest
  extends FlatSpec
  with Matchers
  with ConfiguredTestSuite
  with BeforeAndAfterAll
  with WithMaterializer
  with WithTestWsClient
  with WithTestContentApiClient {

   "Travel Offers Controller" should "404 when an ad is requested where there are no matching offers" in {
     val request = TestRequest().withFormUrlEncodedBody(("k","k1"))
     val travelOffersController = new TravelOffersController(new TravelOffersAgent(testContentApiClient))
     val result = travelOffersController.renderTravel(request)

     status(result) should be(404)
   }

 }
