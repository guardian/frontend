package common.commercial

import common.editions.Uk
import org.scalatest.{FlatSpec, Matchers}

class BrandingTest extends FlatSpec with Matchers {

  "isTargeting" should "be true when there's no specific targeting" in {
    val branding = Branding(
      sponsorshipType = Foundation,
      sponsorName = "Bill and Melinda Gates Foundation",
      sponsorLogo = "https://static.theguardian.com/commercial/sponsor/world/series/united-nations-70-years/logo.png",
      sponsorLink = "http://www.theguardian.com/global-development",
      aboutThisLink = "/sponsored-content",
      targeting = None,
      foundationFundedContext = None
    )

    branding.isTargeting(None, Uk) shouldBe true
  }
}
