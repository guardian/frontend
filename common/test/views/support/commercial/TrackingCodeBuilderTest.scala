package views.support.commercial

import common.commercial._
import org.scalatest.{BeforeAndAfterEach, FlatSpec, Matchers}
import play.api.test.FakeRequest
import views.support.SponsorDataAttributes

class TrackingCodeBuilderTest extends FlatSpec with Matchers with BeforeAndAfterEach {

  private def mkBrandingAttributes(sponsorName: String) = SponsorDataAttributes(
    sponsor = Some(sponsorName),
    sponsorshipType = "",
    seriesId = None,
    keywordId = None
  )

  private def mkBranding(sponsorName: String) = Branding(
    sponsorshipType = Sponsored,
    sponsorName,
    sponsorLogo = "",
    sponsorLink = "",
    aboutThisLink = "",
    targeting = None,
    foundationFundedContext = None
  )

  private def mkCardContent(index: Int, branding: Option[Branding] = None) = CardContent(
    icon = None,
    headline = s"headline-$index",
    kicker = None,
    description = None,
    image = None,
    fallbackImageUrl = None,
    targetUrl = "",
    branding
  )

  private def mkContainerModel(brandingAttributes: Option[SponsorDataAttributes] = None) = {

    def mkContainerContent() = ContainerContent(
      title = "container-title",
      description = None,
      targetUrl = None,
      initialCards = Seq(
        mkCardContent(1),
        mkCardContent(2),
        mkCardContent(3),
        mkCardContent(4),
        mkCardContent(5),
        mkCardContent(6),
        mkCardContent(7),
        mkCardContent(8),
        mkCardContent(9)
      ),
      showMoreCards = Seq(mkCardContent(10), mkCardContent(11))
    )

    ContainerModel(
      id = "",
      layoutName = "",
      mkContainerContent(),
      brandingAttributes,
      branding = None
    )
  }

  "mkInteractionTrackingCode" should "populate tracking code when container has common branding" in {
    val code = TrackingCodeBuilder.mkInteractionTrackingCode(
      frontId = "front-id",
      containerIndex = 2,
      container = mkContainerModel(brandingAttributes = Some(mkBrandingAttributes("sponsor-name"))),
      card = mkCardContent(5)
    )(request = FakeRequest().withHeaders("X-Gu-Edition" -> "US"))
    code shouldBe
      "Labs front container | US | front-id | container-3 | container-title | sponsor-name | card-5 | headline-5"
  }

  it should "populate tracking code when card has individual branding" in {
    val code = TrackingCodeBuilder.mkInteractionTrackingCode(
      frontId = "front-id",
      containerIndex = 5,
      container = mkContainerModel(),
      card = mkCardContent(3, branding = Some(mkBranding("card-sponsor")))
    )(request = FakeRequest().withHeaders("X-Gu-Edition" -> "US"))
    code shouldBe
      "Labs front container | US | front-id | container-6 | container-title | card-sponsor | card-3 | headline-3"
  }

  it should "populate tracking code when dynamic container has individual branding" in {
    val code = TrackingCodeBuilder.mkInteractionTrackingCode(
      frontId = "front-id",
      containerIndex = 2,
      container = mkContainerModel(brandingAttributes = Some(mkBrandingAttributes("sponsor-name"))),
      card = mkCardContent(5)
    )(request = FakeRequest().withHeaders("X-Gu-Edition" -> "US"))
    code shouldBe
      "Labs front container | US | front-id | container-3 | container-title | sponsor-name | card-5 | headline-5"
  }
}
