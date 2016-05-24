package views.support.commercial

import common.commercial._
import org.scalatest.{FlatSpec, Matchers}
import play.api.test.FakeRequest
import views.support.SponsorDataAttributes

class TrackingCodeBuilderTest extends FlatSpec with Matchers {

  def mkBranding(sponsor: String) = SponsorDataAttributes(
    sponsor = Some(sponsor),
    sponsorshipType = "",
    seriesId = None,
    keywordId = None
  )

  def mkCardContent(index: Int, brandingAttributes: Option[SponsorDataAttributes] = None) = CardContent(
    icon = None,
    headline = s"headline-$index",
    kicker = None,
    description = None,
    image = None,
    fallbackImageUrl = None,
    targetUrl = "",
    branding = None
  )

  def mkContainerModel(brandingAttributes: Option[SponsorDataAttributes] = None) = {

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
      container = mkContainerModel(brandingAttributes = Some(mkBranding("sponsor-name"))),
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
      card = mkCardContent(3, brandingAttributes = Some(mkBranding("card-sponsor")))
    )(request = FakeRequest().withHeaders("X-Gu-Edition" -> "US"))
    code shouldBe
      "Labs front container | US | front-id | container-6 | container-title | card-sponsor | card-3 | headline-3"
  }

  it should "populate tracking code when dynamic container has individual branding" in {
    val code = TrackingCodeBuilder.mkInteractionTrackingCode(
      frontId = "front-id",
      containerIndex = 2,
      container = mkContainerModel(brandingAttributes = Some(mkBranding("sponsor-name"))),
      card = mkCardContent(5)
    )(request = FakeRequest().withHeaders("X-Gu-Edition" -> "US"))
    code shouldBe
      "Labs front container | US | front-id | container-3 | container-title | sponsor-name | card-5 | headline-5"
  }
}
