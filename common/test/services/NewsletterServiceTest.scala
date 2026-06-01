package services

import model.{Tag, TagProperties}
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito.{verifyNoInteractions, when}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import services.newsletters.NewsletterSignupAgent
import services.newsletters.model.NewsletterResponseV2

class NewsletterServiceTest extends AnyFlatSpec with Matchers with MockitoSugar {

  // Helpers

  def mkTag(id: String, tagType: String = "Keyword"): Tag =
    Tag(
      properties = TagProperties(
        id = id,
        url = s"https://content.guardianapis.com/$id",
        tagType = tagType,
        sectionId = id.split("/").head,
        sectionName = id.split("/").head,
        webTitle = id.split("/").last,
        webUrl = s"https://www.theguardian.com/$id",
        twitterHandle = None,
        bio = None,
        description = None,
        emailAddress = None,
        contributorLargeImagePath = None,
        bylineImageUrl = None,
        podcast = None,
        references = Seq.empty,
        paidContentType = None,
        commercial = None,
      ),
      pagination = None,
      richLinkId = None,
    )

  def mkNewsletterResponse(
      identityName: String,
      status: String = "live",
      restricted: Boolean = false,
  ): NewsletterResponseV2 =
    NewsletterResponseV2(
      identityName = identityName,
      listId = 1234,
      name = "The Long Read",
      theme = "features",
      group = "Features",
      status = status,
      restricted = restricted,
      signUpEmbedDescription = "Great long reads",
      signUpDescription = "For the long reads",
      highlightCardTitle = Some("Sign up to long reads (highlight)"),
      frequency = "Weekly",
      mailSuccessDescription = Some("You're subscribed!"),
      regionFocus = None,
      illustrationCard = None,
      illustrationCircle = None,
      illustrationSquare = Some("https://example.com/square.png"),
      seriesTag = None,
      signupPage = None,
      exampleUrl = Some("https://example.com/newsletter"),
      category = "article-based",
      emailConfirmation = false,
    )

  // Tests

  "getNewsletterDataFromTags" should "return NewsletterData when both newsletter-sign-up and campaign/email tags are present and newsletter is live" in {
    val agent = mock[NewsletterSignupAgent]
    val service = new NewsletterService(agent)

    val newsletter = mkNewsletterResponse("the-long-read")
    when(agent.getV2NewsletterByName("the-long-read")).thenReturn(Right(Some(newsletter)))

    val tags = List(
      mkTag("info/newsletter-sign-up"),
      mkTag("campaign/email/the-long-read", tagType = "Campaign"),
    )

    val result = service.getNewsletterDataFromTags(tags)

    result shouldBe defined
    result.get.identityName shouldBe "the-long-read"
    result.get.name shouldBe "The Long Read"
    result.get.frequency shouldBe "Weekly"
    result.get.illustrationSquare shouldBe Some("https://example.com/square.png")
    result.get.successDescription shouldBe "You're subscribed!"
  }

  it should "return None when the info/newsletter-sign-up tag is missing" in {
    val agent = mock[NewsletterSignupAgent]
    val service = new NewsletterService(agent)

    val tags = List(
      mkTag("campaign/email/the-long-read", tagType = "Campaign"),
    )

    val result = service.getNewsletterDataFromTags(tags)

    result shouldBe None
    verifyNoInteractions(agent)
  }

  it should "return None when no campaign/email tag is present" in {
    val agent = mock[NewsletterSignupAgent]
    val service = new NewsletterService(agent)

    when(agent.getV2NewsletterByName(anyString())).thenReturn(Right(None))

    val tags = List(
      mkTag("info/newsletter-sign-up"),
      mkTag("tone/news"),
    )

    val result = service.getNewsletterDataFromTags(tags)

    result shouldBe None
  }

  it should "return None when the newsletter is not live" in {
    val agent = mock[NewsletterSignupAgent]
    val service = new NewsletterService(agent)

    val cancelledNewsletter = mkNewsletterResponse("the-long-read", status = "cancelled")
    when(agent.getV2NewsletterByName("the-long-read")).thenReturn(Right(Some(cancelledNewsletter)))

    val tags = List(
      mkTag("info/newsletter-sign-up"),
      mkTag("campaign/email/the-long-read", tagType = "Campaign"),
    )

    val result = service.getNewsletterDataFromTags(tags)

    result shouldBe None
  }

  it should "return None when the newsletter is restricted" in {
    val agent = mock[NewsletterSignupAgent]
    val service = new NewsletterService(agent)

    val restrictedNewsletter = mkNewsletterResponse("the-long-read", restricted = true)
    when(agent.getV2NewsletterByName("the-long-read")).thenReturn(Right(Some(restrictedNewsletter)))

    val tags = List(
      mkTag("info/newsletter-sign-up"),
      mkTag("campaign/email/the-long-read", tagType = "Campaign"),
    )

    val result = service.getNewsletterDataFromTags(tags)

    result shouldBe None
  }

  it should "return None when the agent lookup returns Left (error)" in {
    val agent = mock[NewsletterSignupAgent]
    val service = new NewsletterService(agent)

    when(agent.getV2NewsletterByName("the-long-read")).thenReturn(Left("API error"))

    val tags = List(
      mkTag("info/newsletter-sign-up"),
      mkTag("campaign/email/the-long-read", tagType = "Campaign"),
    )

    val result = service.getNewsletterDataFromTags(tags)

    result shouldBe None
  }

  it should "extract identityName correctly from the campaign/email tag path" in {
    val agent = mock[NewsletterSignupAgent]
    val service = new NewsletterService(agent)

    val newsletter = mkNewsletterResponse("tech-scape")
    when(agent.getV2NewsletterByName("tech-scape")).thenReturn(Right(Some(newsletter)))

    val tags = List(
      mkTag("info/newsletter-sign-up"),
      mkTag("campaign/email/tech-scape", tagType = "Campaign"),
    )

    val result = service.getNewsletterDataFromTags(tags)

    result shouldBe defined
    result.get.identityName shouldBe "tech-scape"
  }
}
