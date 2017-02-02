package common.commercial

import com.gu.commercial.branding.{Branding, Foundation, Logo}
import org.scalatest.{FlatSpec, Matchers}

class BrandingTest extends FlatSpec with Matchers {

  "isTargeting" should "be true when there's no specific targeting" in {
    val branding = Branding(
      brandingType = Foundation,
      sponsorName = "Bill and Melinda Gates Foundation",
      logo = Logo(
        src = "https://static.theguardian.com/commercial/sponsor/world/series/united-nations-70-years/logo.png",
        dimensions = None,
        link = "http://www.theguardian.com/global-development",
        label = ""
      ),
      logoForDarkBackground = None,
      aboutThisLink = Some("/sponsored-content")
    )
  }
}
