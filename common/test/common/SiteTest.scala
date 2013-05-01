package common

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import play.api.test.FakeRequest

class SiteTest extends FlatSpec with ShouldMatchers {

  "Site" should "resolve correct site" in {

    val request = FakeRequest().withHeaders("host" -> "m.guardian.co.uk")

    Site(request) should be(Some(Site(ukHost = "m.guardian.co.uk", usHost = "m.guardiannews.com",
      ukDesktopHost = "www.guardian.co.uk", usDesktopHost = "www.guardiannews.com",
       edition = "UK"
    )))
  }

  it should "resolve correct US site" in {

    val request = FakeRequest().withHeaders("host" -> "m.guardiannews.com")

    Site(request) should be(Some(Site(ukHost = "m.guardian.co.uk", usHost = "m.guardiannews.com",
      ukDesktopHost = "www.guardian.co.uk", usDesktopHost = "www.guardiannews.com",
      edition = "US"
    )))
  }

}
