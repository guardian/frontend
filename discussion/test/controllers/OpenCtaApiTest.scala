package controllers

import org.scalatest.{FlatSpecLike, ShouldMatchers}
import play.api.test._
import play.api.test.Helpers._
import java.net.ServerSocket

class OpenCtaApiTest extends OpenCtaApi with FlatSpecLike with ShouldMatchers {

  val availablePort: Int = new ServerSocket(0).getLocalPort

  "CtaController" should "respond to request for callouts for a given discussion key" in {
    running(TestServer(availablePort)) {
     val alternativeUrl =  "/open/topcomments/p/k123.json"
      val Some(response) = route(FakeRequest("GET", "/open/cta/p/k123.json"))

      status(response) should be(OK)
      contentAsString(response) should include("html")
      contentAsString(response) should include("refreshStatus")
    }
  }

}




