package views.support

import com.gu.commercial.branding._
import common.commercial._
import layout.cards.Half
import layout.{
  ContentCard,
  DiscussionSettings,
  DisplaySettings,
  EditionalisedLink,
  FaciaCardHeader,
  ItemClasses,
  PaidCard,
}
import model.pressed
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.BeforeAndAfterEach
import org.scalatest.matchers.should.Matchers
import play.api.test.FakeRequest
import views.support.Commercial.TrackingCodeBuilder

class TrackingCodeBuilderTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach {

  private def mkBranding(sponsorName: String) =
    Branding(
      brandingType = Sponsored,
      sponsorName,
      logo = Logo(
        src = "",
        dimensions = None,
        link = "",
        label = "",
      ),
      logoForDarkBackground = None,
      aboutThisLink = Branding.defaultAboutThisLink,
      hostedCampaignColour = None,
    )

  private def mkCardContent(index: Int, branding: Option[Branding] = None) =
    PaidCard(
      icon = None,
      headline = s"headline-$index",
      kicker = None,
      description = None,
      image = None,
      fallbackImageUrl = None,
      targetUrl = "",
      None,
      branding,
    )

  private def mkContainerModel(branding: Option[Branding] = None) = {

    def mkContainerContent() =
      ContainerContent(
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
          mkCardContent(9),
        ),
        showMoreCards = Seq(mkCardContent(10), mkCardContent(11)),
      )

    ContainerModel(
      id = "",
      layoutName = "",
      mkContainerContent(),
      branding = branding,
    )
  }

  "mkInteractionTrackingCode" should "populate tracking code when container has common branding" in {
    val code = TrackingCodeBuilder.mkInteractionTrackingCode(
      frontId = "front-id",
      containerIndex = 2,
      container = mkContainerModel(branding = Some(mkBranding("sponsor-name"))),
      card = mkCardContent(5),
    )(request = FakeRequest().withHeaders("X-Gu-Edition" -> "US"))
    code shouldBe
      "Labs front container | US | front-id | container-3 | container-title | sponsor-name | card-5 | headline-5"
  }

  it should "populate tracking code when card has individual branding" in {
    val code = TrackingCodeBuilder.mkInteractionTrackingCode(
      frontId = "front-id",
      containerIndex = 5,
      container = mkContainerModel(),
      card = mkCardContent(3, branding = Some(mkBranding("card-sponsor"))),
    )(request = FakeRequest().withHeaders("X-Gu-Edition" -> "US"))
    code shouldBe
      "Labs front container | US | front-id | container-6 | container-title | card-sponsor | card-3 | headline-3"
  }

  it should "populate tracking code when dynamic container has individual branding" in {
    val code = TrackingCodeBuilder.mkInteractionTrackingCode(
      frontId = "front-id",
      containerIndex = 2,
      container = mkContainerModel(branding = Some(mkBranding("sponsor-name"))),
      card = mkCardContent(5),
    )(request = FakeRequest().withHeaders("X-Gu-Edition" -> "US"))
    code shouldBe
      "Labs front container | US | front-id | container-3 | container-title | sponsor-name | card-5 | headline-5"
  }

  it should "generate correct tracking code when front ID has an empty value" in {
    val code = TrackingCodeBuilder.mkInteractionTrackingCode(
      containerIndex = 0,
      cardIndex = 0,
      card = ContentCard(
        id = None,
        header = FaciaCardHeader(
          quoted = false,
          isExternal = false,
          isVideo = false,
          isGallery = false,
          isAudio = false,
          kicker = None,
          headline = "headline",
          url = EditionalisedLink(
            baseUrl = "",
          ),
        ),
        byline = None,
        displayElement = None,
        cutOut = None,
        cardStyle = pressed.Review,
        cardTypes = ItemClasses(
          mobile = Half,
          tablet = Half,
          desktop = None,
        ),
        sublinks = Nil,
        starRating = None,
        discussionSettings = DiscussionSettings(
          isCommentable = false,
          isClosedForComments = false,
          discussionId = None,
        ),
        snapStuff = None,
        webPublicationDate = None,
        trailText = None,
        mediaType = None,
        displaySettings = DisplaySettings(
          isBoosted = false,
          showBoostedHeadline = false,
          showQuotedHeadline = false,
          imageHide = false,
          showLivePlayable = false,
        ),
        isLive = false,
        timeStampDisplay = None,
        shortUrl = None,
        useShortByline = false,
        group = "",
        branding = None,
        properties = None,
      ),
      containerDisplayName = Some("Related content"),
      frontId = Some(""),
    )(request = FakeRequest())
    code shouldBe "Onward container | UK | unknown front id | container-1 | Related content | unknown | card-1 | headline"
  }
}
