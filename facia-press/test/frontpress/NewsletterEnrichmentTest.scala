package frontpress

import common.facia.FixtureBuilder
import model.pressed.{CuratedContent, PressedStory}
import model.{Tag, TagProperties, Tags}
import org.mockito.Mockito._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import services.{NewsletterData, NewsletterService}

class NewsletterEnrichmentTest extends AnyFlatSpec with Matchers with MockitoSugar {

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

  def mkNewsletterData(identityName: String = "the-long-read"): NewsletterData =
    NewsletterData(
      identityName = identityName,
      name = "The Long Read",
      theme = "features",
      description = "Great long reads",
      frequency = "Weekly",
      listId = 1234,
      group = "Features",
      successDescription = "You're subscribed!",
      regionFocus = None,
      illustrationCard = None,
      illustrationSquare = Some("https://example.com/square.png"),
      exampleUrl = Some("https://example.com/newsletter"),
      category = "article-based",
    )

  def contentWithTags(tags: List[Tag]): CuratedContent = {
    val base = FixtureBuilder.mkPressedCuratedContent(1).asInstanceOf[CuratedContent]
    // Attach a minimal PressedStory carrying the given tags
    val story = mock[PressedStory]
    when(story.tags).thenReturn(Tags(tags))
    base.copy(properties = base.properties.copy(maybeContent = Some(story)))
  }

  "NewsletterEnrichment.enrichWithNewsletterData" should "set newsletterData on content when service returns data" in {
    val service = mock[NewsletterService]
    val newsletterData = mkNewsletterData()
    val tags = List(
      mkTag("info/newsletter-sign-up"),
      mkTag("campaign/email/the-long-read", tagType = "Campaign"),
    )
    val content = contentWithTags(tags)

    when(service.getNewsletterDataFromTags(tags)).thenReturn(Some(newsletterData))

    val result = NewsletterEnrichment.enrichWithNewsletterData(content, service)

    result.properties.newsletterData shouldBe Some(newsletterData)
  }

  it should "leave newsletterData as None when service returns None" in {
    val service = mock[NewsletterService]
    val tags = List(mkTag("tone/news"))
    val content = contentWithTags(tags)

    when(service.getNewsletterDataFromTags(tags)).thenReturn(None)

    val result = NewsletterEnrichment.enrichWithNewsletterData(content, service)

    result.properties.newsletterData shouldBe None
  }

  it should "leave newsletterData as None when content has no maybeContent" in {
    val service = mock[NewsletterService]
    val content = FixtureBuilder.mkPressedCuratedContent(1).asInstanceOf[CuratedContent]
    // maybeContent is None by default in FixtureBuilder

    val result = NewsletterEnrichment.enrichWithNewsletterData(content, service)

    result.properties.newsletterData shouldBe None
    verifyNoInteractions(service)
  }
}
