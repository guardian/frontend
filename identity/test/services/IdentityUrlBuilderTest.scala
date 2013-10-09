package services

import org.scalatest.path
import conf.IdentityConfiguration
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.mock.MockitoSugar
import org.mockito.Mockito._
import idapiclient.TrackingData

class IdentityUrlBuilderTest extends path.FreeSpec with ShouldMatchers with MockitoSugar {
  val conf = new IdentityConfiguration
  val idRequest = mock[IdentityRequest]
  val omnitureTracking = mock[TrackingData]
  when(idRequest.trackingData) thenReturn omnitureTracking
  when(idRequest.returnUrl) thenReturn None
  when(omnitureTracking.registrationType) thenReturn None

  val idUrlBuilder = new IdentityUrlBuilder(conf)

  "queryParams" - {
    "if provided a valid returnUrl" - {
      when(idRequest.returnUrl) thenReturn Some("http://returnUrl")

      "should include returnUrl in the returned params" in {
        idUrlBuilder.queryParams(idRequest) should contain("returnUrl" -> "http://returnUrl")
      }
    }

    "if not provided a returnUrl" - {
      when(idRequest.returnUrl) thenReturn None

      "should not include returnUrl in returned params" in {
        idUrlBuilder.queryParams(idRequest).map(param => param._1) should not contain "returnUrl"
      }
    }

    "if provided a regitration type parameter" - {
      when(omnitureTracking.registrationType) thenReturn Some("test")

      "should include type parameter" in {
        idUrlBuilder.queryParams(idRequest) should contain("type" -> "test")
      }
    }

    "if not provided a regitration type" - {
      when(omnitureTracking.registrationType) thenReturn None

      "should not include returnUrl in returned params" in {
        idUrlBuilder.queryParams(idRequest).map(param => param._1) should not contain "type"
      }
    }
  }

  "appendQueryParams" - {
    "should add params to bare URL" in {
      val appended = idUrlBuilder.appendQueryParams("http://example.com", List("test" -> "foo", "test2" -> "bar"))
      appended should equal("http://example.com?test=foo&test2=bar")
    }

    "should add params to url that already has a querystring" in {
      val appended = idUrlBuilder.appendQueryParams("http://example.com?existing=true", List("test" -> "foo", "test2" -> "bar"))
      appended should equal("http://example.com?existing=true&test=foo&test2=bar")
    }

    "should urlEncode the parameters" in {
      val appended = idUrlBuilder.appendQueryParams("http://example.com", List("test&" -> "foo+"))
      appended should equal("http://example.com?test%26=foo%2B")
    }
  }

  "build" - {
    when(idRequest.returnUrl) thenReturn Some("foo")
    when(omnitureTracking.registrationType) thenReturn Some("bar")

    "should add path and params to configured root" - {
      idUrlBuilder.buildUrl("/test/path", idRequest) should equal(conf.id.url + "/test/path?returnUrl=foo&type=bar")
    }
  }
}
