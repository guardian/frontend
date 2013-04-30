package common

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import play.api.test.FakeRequest

class SiteTest extends FlatSpec with ShouldMatchers {

  "Site" should "resolve correct site" in {

    val request = FakeRequest().withHeaders("host" -> "m.guardian.co.uk")

    Site(request) should be(Site(ukHost = "m.guardian.co.uk", usHost = "m.guardiannews.com",
      ukDesktopHost = "www.guardian.co.uk", usDesktopHost = "www.guardiannews.com",
      ukAjaxHost = "m.guardian.co.uk", usAjaxHost = "m.guardiannews.com", edition = "UK"
    ))
  }

  it should "resolve correct US site" in {

    val request = FakeRequest().withHeaders("host" -> "m.guardiannews.com")

    Site(request) should be(Site(ukHost = "m.guardian.co.uk", usHost = "m.guardiannews.com",
      ukDesktopHost = "www.guardian.co.uk", usDesktopHost = "www.guardiannews.com",
      ukAjaxHost = "m.guardian.co.uk", usAjaxHost = "m.guardiannews.com", edition = "US"
    ))
  }

  it should "override the edition if the edition parameter is set" in {

    val request = FakeRequest("GET", "http://localhost:9000?_edition=UK")
      .withHeaders("host" -> "m.guardiannews.com")

    Site(request) should be(Site(ukHost = "m.guardian.co.uk", usHost = "m.guardiannews.com",
      ukDesktopHost = "www.guardian.co.uk", usDesktopHost = "www.guardiannews.com",
      ukAjaxHost = "m.guardian.co.uk", usAjaxHost = "m.guardiannews.com", edition = "UK"
    ))
  }

  it should "resolve a dynamic site" in {

    val request = FakeRequest().withHeaders("host" -> "foo@proxylocal.com")

    Site(request) should be(Site(ukHost = "foo@proxylocal.com", usHost = "foo@proxylocal.com",
      ukDesktopHost = "foo@proxylocal.com", usDesktopHost = "foo@proxylocal.com",
      ukAjaxHost = "foo@proxylocal.com", usAjaxHost = "foo@proxylocal.com", edition = "UK"
    ))
  }

}
