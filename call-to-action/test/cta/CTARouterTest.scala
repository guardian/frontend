package cta

import org.scalatest.{ShouldMatchers, FreeSpec}
import play.api.test.Helpers._
import play.api.test.{FakeApplication, FakeRequest}
import akka.util.Timeout

class CTARouterTest extends FreeSpec with ShouldMatchers {

  "The Router" - {

    "Should return 200 for valid request to cta.theguardian.com host" in {
      running(FakeApplication()) {
        val request = FakeRequest(GET, "/forarticle/p/1a3d").withHeaders(("Host", "cta.theguardian.com"))

        val Some(result) = route(request)

        status(result) should be(200)
      }
    }

    "Should return 404 if the host header is not cta.guardian.com" in {
      running(FakeApplication()) {
        val requestOnLocalhost = FakeRequest(GET, "/forarticle/p/1a3d").withHeaders(("host", "localhost"))

        val result = route(requestOnLocalhost)

        result should be(None)
      }
    }

    "Should return 404 if the articleId is missing" in {
      running(FakeApplication()) {
        val request = FakeRequest(GET, "/forarticle").withHeaders(("host", "cta.theguardian.com"))

        val result = route(request)

        result should be(None)
      }
    }

  }

  "The Controller" - {

    "Should return the right caching headers" in {
      running(FakeApplication()) {
        val request = FakeRequest(GET, "/forarticle/p/1a3d").withHeaders(("Host", "cta.theguardian.com"))

        val Some(result) = route(request)

        headers(result)(Timeout(2000L))("Cache-Control") should be("max-age=3600")
      }
    }
  }
}
