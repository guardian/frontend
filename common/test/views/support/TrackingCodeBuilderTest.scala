package views.support

import com.gu.commercial.branding._
import common.commercial._
import layout.PaidCard
import org.scalatest.{BeforeAndAfterEach, FlatSpec, Matchers}
import play.api.test.FakeRequest
import views.support.Commercial.TrackingCodeBuilder

class TrackingCodeBuilderTest extends FlatSpec with Matchers with BeforeAndAfterEach {

  private def mkBranding(sponsorName: String) = Branding(
    brandingType = Sponsored,
    sponsorName,
    logo = Logo(
      src = "",
      dimensions = None,
      link = "",
      label = ""
    ),
    logoForDarkBackground = None,
    aboutThisLink = Branding.defaultAboutThisLink,
    hostedCampaignColour = None
  )

  private def mkCardContent(index: Int, branding: Option[Branding] = None) = PaidCard(
    icon = None,
    headline = s"headline-$index",
    kicker = None,
    description = None,
    image = None,
    fallbackImageUrl = None,
    targetUrl = "",
    None,
    branding,
    None
  )

  private def mkContainerModel(branding: Option[Branding] = None) = {

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
      branding = branding
    )
  }

  "mkInteractionTrackingCode" should "populate tracking code when container has common branding" in {
    val code = TrackingCodeBuilder.mkInteractionTrackingCode(
      frontId = "front-id",
      containerIndex = 2,
      container = mkContainerModel(branding = Some(mkBranding("sponsor-name"))),
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
      container = mkContainerModel(branding = Some(mkBranding("sponsor-name"))),
      card = mkCardContent(5)
    )(request = FakeRequest().withHeaders("X-Gu-Edition" -> "US"))
    code shouldBe
      "Labs front container | US | front-id | container-3 | container-title | sponsor-name | card-5 | headline-5"
  }
}
