package controllers

import org.scalatest.{FlatSpecLike, ShouldMatchers}
import play.api.test._
import play.api.test.Helpers._
import java.net.ServerSocket
import discussion.api.CtaApi
import conf.Configuration

class CtaApiTest extends CtaApi with FlatSpecLike with ShouldMatchers {

  val availablePort: Int = new ServerSocket(0).getLocalPort
  protected val ctaApiRoot: String = Configuration.open.ctaApiRoot

  "CtaController" should "respond to request for callouts for a given discussion key" in {
    running(TestServer(availablePort)) {
      val Some(response) = route(FakeRequest("GET", "/open/cta/article/p/k123.json"))

      status(response) should be(OK)
      contentAsString(response) should include("html")
      contentAsString(response) should include("refreshStatus")
    }
  }
}




