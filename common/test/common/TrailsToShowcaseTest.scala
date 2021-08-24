package common

import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import com.gu.contentapi.client.model.v1.ContentFields
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import com.gu.facia.api.utils.Editorial
import com.sun.syndication.feed.module.mediarss.MediaEntryModule
import implicits.Dates.jodaToJavaInstant
import model.pressed._
import model.{ImageAsset, ImageMedia}
import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}
import play.api.test.FakeRequest

import java.time.ZoneOffset
import scala.xml.XML

class TrailsToShowcaseTest extends FlatSpec with Matchers {

  val request = FakeRequest()

  val imageMedia: ImageMedia = {
    val asset = ImageAsset(
      fields = Map.empty,
      mediaType = "",
      mimeType = Some("image/jpeg"),
      url = Some("http://localhost/trail.jpg"),
    )
    ImageMedia(Seq(asset))
  }

  val wayBackWhen = new DateTime(2021, 3, 2, 12, 30, 1)
  val lastModifiedWayBackWhen = wayBackWhen.plusHours(1)

  "TrailsToShowcase" should "set module namespaces in feed header" in {
    val singleStoryTrails =
      Seq(makePressedContent(webPublicationDate = Some(wayBackWhen), trailPicture = Some(imageMedia)))

    val rss = XML.loadString(TrailsToShowcase(Option("foo"), singleStoryTrails, Seq.empty, "", "")(request))

    rss.getNamespace("g") should be("http://schemas.google.com/pcn/2020")
    rss.getNamespace("media") should be("http://search.yahoo.com/mrss/")
  }

  "TrailsToShowcase" can "render feed with Single Story and Rundown panels" in {
    val content = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      byline = Some("Trail byline"),
    )
    val singleStoryTrails = Seq(content)
    val rundownTrails = Seq(content, content)

    val rss = XML.loadString(
      TrailsToShowcase(
        Option("foo"),
        singleStoryTrails,
        rundownTrails,
        "Rundown container title",
        "rundown-container-id",
      )(request),
    )

    val channelItems = rss \ "channel" \ "item"
    val singleStoryPanels =
      channelItems.filter(node => (node \ "panel").filter(_.prefix == "g").filter(_.text == "SINGLE_STORY").nonEmpty)
    singleStoryTrails.size should be(1)

    val rundownPanels =
      channelItems.filter(node => (node \ "panel").filter(_.prefix == "g").filter(_.text == "RUNDOWN").nonEmpty)
    rundownPanels.size should be(1)

    val singleStoryPanel = singleStoryPanels.head
    // (singleStoryPanel \ "guid").text should be("https://www.theguardian.com/an-articlce") // TODO Correct?
    (singleStoryPanel \ "title").text should be("A headline")
    (singleStoryPanel \ "link").text should be(
      "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
    )
    (singleStoryPanel \ "creator").filter(_.prefix == "dc").head.text should be(
      "Trail byline",
    ) // TODO should be <author> in Google Showcase docs
    (singleStoryPanel \ "published").filter(_.prefix == "atom").text should be("2021-03-02T12:30:01Z")
    (singleStoryPanel \ "updated").filter(_.prefix == "atom").text should be("2021-03-02T13:30:01Z")

    val singleStoryPanelMedia = (singleStoryPanel \ "content").filter(_.prefix == "media")
    singleStoryPanelMedia.size should be(1)
    singleStoryPanelMedia.head.attribute("url").head.text shouldBe "http://localhost/trail.jpg"

    val rundownPanel = rundownPanels.head
    val rundownPanelGuid = (rundownPanel \ "guid").head
    rundownPanelGuid.text should be("rundown-container-id")
    rundownPanelGuid.attribute("isPermaLink").get.head.text should be("false")

    val rundownPanelMedia = (rundownPanel \ "content").filter(_.prefix == "media")
    rundownPanelMedia.size should be(1)
    rundownPanelMedia.head.attribute("url").head.text shouldBe "http://localhost/trail.jpg"

    // Rundown panels content nested items in the single article group
    val articleGroups = (rundownPanel \ "article_group").filter(_.prefix == "g")
    articleGroups.size should be(1)
    val articleGroup = articleGroups.head
    (articleGroup \ "role").filter(_.prefix == "g").text should be("RUNDOWN")

    // Examine the nested article items
    val articles = articleGroup \ "item"
    articles.size should be(2)

    val rundownArticle = articles.head
    (rundownArticle \ "guid").text should be(
      "http://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
    )
    (rundownArticle \ "title").text should be("A headline")
    (rundownArticle \ "link").text should be(
      "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
    )
    (rundownArticle \ "published").filter(_.prefix == "atom").text should be("2021-03-02T12:30:01Z")
    (rundownArticle \ "updated").filter(_.prefix == "atom").text should be("2021-03-02T13:30:01Z")
  }

  "TrailToShowcase" should "omit rundown panel if there are no rundown trials" in {
    val singleStoryTrails =
      Seq(makePressedContent(webPublicationDate = Some(wayBackWhen), trailPicture = Some(imageMedia)))

    val rss = XML.loadString(TrailsToShowcase(Option("foo"), singleStoryTrails, Seq.empty, "", "")(request))

    val rundownPanels =
      (rss \ "channel" \ "item").filter(node =>
        (node \ "panel").filter(_.prefix == "g").filter(_.text == "RUNDOWN").nonEmpty,
      )
    rundownPanels.size should be(0)
  }

  "TrailToShowcase" can "create Single Story panels from single trails" in {
    val curatedContent = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      headline = "My unique headline",
      byline = Some("Trail byline"),
      kickerText = Some("A Kicker"),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(curatedContent).get

    singleStoryPanel.getTitle should be("My unique headline")
    singleStoryPanel.getAuthor should be("Trail byline")
    singleStoryPanel.getLink should be(
      "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
    )

    val gModule = singleStoryPanel.getModule(GModule.URI).asInstanceOf[GModule]
    gModule.getPanel should be(Some("SINGLE_STORY"))
    gModule.getPanelTitle should be(None) // Specifically omitted
    gModule.getOverline should be(Some("A Kicker"))

    val rssAtomModule = singleStoryPanel.getModule(RssAtomModule.URI).asInstanceOf[RssAtomModule]
    rssAtomModule.getPublished should be(Some(wayBackWhen))
    rssAtomModule.getUpdated should be(Some(lastModifiedWayBackWhen))

    // Single panel stories require a media element which we take from the mayBeContent trail
    val mediaModule = singleStoryPanel.getModule("http://search.yahoo.com/mrss/").asInstanceOf[MediaEntryModule]
    mediaModule.getMediaContents.size should be(1)
    mediaModule.getMediaContents.head.getReference() should be(
      new com.sun.syndication.feed.module.mediarss.types.UrlReference("http://localhost/trail.jpg"),
    )
  }

  "TrailToShowcase" can "should default single panel last updated to web publication date if no last updated value is available" in {
    val curatedContent = makePressedContent(webPublicationDate = Some(wayBackWhen), trailPicture = Some(imageMedia))

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(curatedContent).get

    val rssAtomModule = singleStoryPanel.getModule(RssAtomModule.URI).asInstanceOf[RssAtomModule]
    rssAtomModule.getUpdated should be(Some(wayBackWhen))
  }

  "TrailToShowcase" can "create Rundown panels from a group of trials" in {
    val trail = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      kickerText = Some("A Kicker"),
    )
    val anotherTrail =
      makePressedContent(webPublicationDate = Some(wayBackWhen), lastModified = Some(lastModifiedWayBackWhen))

    val content = Seq(trail, anotherTrail)

    val rundownPanel = TrailsToShowcase.asRundownPanel("Rundown container name", content, "rundown-container-id")
    rundownPanel.getLink should be(null) // TODO
    rundownPanel.getUri should be("rundown-container-id") // Guid for rundown item is the container id.

    val gModule = rundownPanel.getModule(GModule.URI).asInstanceOf[GModule]
    gModule.getPanel should be(Some("RUNDOWN"))
    gModule.getPanelTitle should be(Some("Rundown container name"))

    val articleGroup = gModule.getArticleGroup.get
    articleGroup.role should be(Some("RUNDOWN"))
    articleGroup.articles.size should be(2)

    val firstItemInArticleGroup: GArticle = articleGroup.articles.head
    firstItemInArticleGroup.title should be("A headline")
    firstItemInArticleGroup.link should be(
      "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
    )
    // firstItemInArticleGroup.guid should be("http://www.theguardian.com/a") //TODO
    firstItemInArticleGroup.published should be(wayBackWhen)
    firstItemInArticleGroup.updated should be(lastModifiedWayBackWhen)
    firstItemInArticleGroup.overline should be(Some("A Kicker"))

    // Rundown panel stories require a media element
    val mediaModule = rundownPanel.getModule("http://search.yahoo.com/mrss/").asInstanceOf[MediaEntryModule]
  }

  "TrailToShowcase" can "should default rundown items updated publication date if no last updated value is available" in {
    val content = makePressedContent(webPublicationDate = Some(wayBackWhen))

    val rundownPanel = TrailsToShowcase.asRundownPanel("Rundown container name", Seq(content), "rundown-container-id")

    val gModule = rundownPanel.getModule(GModule.URI).asInstanceOf[GModule]
    val articleGroup = gModule.getArticleGroup.get
    articleGroup.articles.size should be(1)
    articleGroup.articles.head.updated shouldBe (wayBackWhen)
  }

  // This always passes because we are not setting this optional field
  "TrailToShowcase validation" should "omit single panel g:panel_titles longer than 74 characters" in {
    val content = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(content).get

    val gModule = singleStoryPanel.getModule(GModule.URI).asInstanceOf[GModule]
    gModule.getPanelTitle should be(None)
  }

  "TrailToShowcase validation" should "omit single panel g:overlines longer than 30 characters" in {
    val longerThan30 = "This sentence is way longer than 30 characters and should be omitted"
    longerThan30.size > 30 should be(true)

    val content = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      kickerText = Some(longerThan30),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(content).get

    val gModule = singleStoryPanel.getModule(GModule.URI).asInstanceOf[GModule]
    gModule.getOverline should be(None)
  }

  "TrailToShowcase validation" should "reject single panels with titles longer than 86 characters" in {
    val longerThan30 = "This sentence is way longer than 30 characters and should be omitted"
    val longerThan86 = longerThan30 + longerThan30 + longerThan30
    longerThan86.size > 86 should be(true)

    val withLongTitle = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      headline = longerThan86,
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(withLongTitle)

    singleStoryPanel should be(None)
  }

  "TrailToShowcase validation" should "omit single panel author fields longer than 42 characters" in {
    val longerThan42 = "This sentence is way longer than 40 characters and should obviously be omitted"
    longerThan42.size > 42 should be(true)

    val withLongByline = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
      trailPicture = Some(imageMedia),
      byline = Some(longerThan42),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(withLongByline).get

    singleStoryPanel.getAuthor should be("") // TODO Javadoc says this should be null
  }

  "TrailToShowcase validation" should "reject single panels with no image" in {
    val withNoImage = makePressedContent(
      webPublicationDate = Some(wayBackWhen),
      lastModified = Some(lastModifiedWayBackWhen),
    )

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(withNoImage)

    singleStoryPanel should be(None)
  }

  "TrailToShowcase validation" should "reject single panels with images smaller than 640x320" in {
    fail
  }

  "TrailToShowcase validation" should "reject rundown panels with g:panel_titles longer than 74 characters" in {
    fail
  }

  "TrailToShowcase validation" should "omit rundown panel articles g:overlines longer than 30 characters" in {
    fail
  }

  "TrailToShowcase validation" should "reject rundown panel articles with titles longer than 64 characters" in {
    fail
  }

  "TrailToShowcase validation" should "reject rundown panel articles with images smaller than 1200x900" in {
    fail
  }

  private def makePressedContent(
      webPublicationDate: Option[DateTime] = None,
      lastModified: Option[DateTime] = None,
      trailPicture: Option[ImageMedia] = None,
      headline: String = "A headline",
      byline: Option[String] = None,
      kickerText: Option[String] = None,
  ) = {
    val url = "/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report"
    val webUrl =
      "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report"
    val title = "A title"
    val trailText = Some("Some trail text")

    // Create a maybe content with trail to present or trail image
    // This seems to be the most promising media element for a Card.

    val apiContent = ApiContent(
      id = "an-id",
      `type` = com.gu.contentapi.client.model.v1.ContentType.Article,
      sectionId = None,
      sectionName = None,
      webPublicationDate = webPublicationDate.map(jodaToJavaInstant(_).atOffset(ZoneOffset.UTC).toCapiDateTime),
      webTitle = title,
      webUrl = webUrl,
      apiUrl = "",
      fields = None,
    )
    val trail = PressedTrail(
      trailPicture = trailPicture,
      byline = None,
      thumbnailPath = None,
      webPublicationDate = webPublicationDate.get, // TODO Naked get
    )
    val mayBeContent = Some(PressedStory.apply(apiContent).copy(trail = trail))

    val properties = PressedProperties(
      isBreaking = false,
      showByline = false,
      showKickerTag = false,
      imageSlideshowReplace = false,
      maybeContent = mayBeContent,
      maybeContentId = None,
      isLiveBlog = false,
      isCrossword = false,
      byline = byline,
      image = None,
      webTitle = title,
      linkText = None,
      embedType = None,
      embedCss = None,
      embedUri = None,
      maybeFrontPublicationDate = None,
      href = None,
      webUrl = Some("an-article"),
      editionBrandings = None,
      atomId = None,
      showMainVideo = false,
    )

    val kicker = kickerText.map { k =>
      FreeHtmlKicker(KickerProperties(kickerText = Some(k)), "Kicker body")
    }

    val header = PressedCardHeader(
      isVideo = false,
      isComment = false,
      isGallery = false,
      isAudio = false,
      kicker = kicker,
      seriesOrBlogKicker = None,
      headline = headline,
      url = url,
      hasMainVideoElement = None,
    )

    val card = PressedCard(
      id = "sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
      cardStyle = CardStyle.make(Editorial),
      webPublicationDateOption = webPublicationDate,
      lastModifiedOption = lastModified,
      trailText = trailText,
      mediaType = None,
      starRating = None,
      shortUrl = "",
      shortUrlPath = None,
      isLive = true,
      group = "",
    )

    val discussionSettings = PressedDiscussionSettings(
      isCommentable = false,
      isClosedForComments = true,
      discussionId = None,
    )

    val displaySettings = PressedDisplaySettings(
      isBoosted = false,
      showBoostedHeadline = false,
      showQuotedHeadline = false,
      showLivePlayable = false,
      imageHide = false,
    )

    CuratedContent(
      properties = properties,
      header = header,
      card = card,
      discussion = discussionSettings,
      display = displaySettings,
      format = None,
      enriched = None,
      supportingContent = Seq.empty.toList,
      cardStyle = CardStyle.make(Editorial),
    )
  }

}
