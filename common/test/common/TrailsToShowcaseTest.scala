package common

import play.api.test.FakeRequest

import java.time.ZoneOffset
import java.nio.file.{Files, Paths}
import java.nio.charset.StandardCharsets
import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}
import org.scalatestplus.play.guice.GuiceOneAppPerSuite
import play.api.test.FakeRequest
import com.gu.contentapi.client.model.v1.{ContentFields, Content => ApiContent}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import implicits.Dates.jodaToJavaInstant
import model.{ImageAsset, ImageMedia, Trail}
import org.scalatest.{FlatSpec, Matchers}
import org.scalatestplus.play.guice.GuiceOneAppPerSuite
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import com.gu.facia.api.utils.Editorial
import com.sun.syndication.feed.module
import com.sun.syndication.feed.module.georss.GMLModuleImpl
import com.sun.syndication.feed.module.mediarss.MediaEntryModule
import implicits.Dates.jodaToJavaInstant
import layout.ContentCard
import model.pressed.{CardStyle, CuratedContent, FreeHtmlKicker, ItemKicker, KickerProperties, LiveKicker, PressedCard, PressedCardHeader, PressedContent, PressedDiscussionSettings, PressedDisplaySettings, PressedProperties, SupportingCuratedContent}

import java.util.Date
import scala.util.Try
import scala.xml._
import scala.xml.XML

class TrailsToShowcaseTest extends FlatSpec with Matchers {

  val request = FakeRequest()

  val imageMedia: ImageMedia = {
    val asset = ImageAsset(fields = Map.empty, mediaType = "", mimeType = Some("image/jpeg"), url = Some("http://localhost/trail.jpg"))
    ImageMedia(Seq(asset))
  }

  val wayBackWhen = new DateTime(2021, 3, 2, 12, 30, 1)

  "TrailsToShowcase" should "set module namespaces in feed header" in {
    val singleStoryTrails = Seq(makePressedContent(webPublicationDate = Some(wayBackWhen)))

    val rss = XML.loadString(TrailsToShowcase(Option("foo"), singleStoryTrails, Seq.empty, "", "")(request))

    rss.getNamespace("g") should be("http://schemas.google.com/pcn/2020")
    rss.getNamespace("media") should be("http://search.yahoo.com/mrss/")
  }

  "TrailsToShowcase" can "render feed with Single Story and Rundown panels" in {
    val content = makePressedContent(webPublicationDate = Some(wayBackWhen))
    val singleStoryTrails = Seq(content)
    val rundownTrails = Seq(content, content)

    val rss = XML.loadString(TrailsToShowcase(Option("foo"), singleStoryTrails,
      rundownTrails, "Rundown container title", "rundown-container-id")(request))

    val channelItems = rss \ "channel" \ "item"
    val singleStoryPanels = channelItems.filter( node => ( node \ "panel").filter(_.prefix == "g").filter(_.text == "SINGLE_STORY").nonEmpty)
    singleStoryTrails.size should be(1)

    val rundownPanels = channelItems.filter( node => ( node \ "panel").filter(_.prefix == "g").filter(_.text == "RUNDOWN").nonEmpty)
    rundownPanels.size should be(1)

    val singleStoryPanel = singleStoryPanels.head
    // (singleStoryPanel \ "guid").text should be("https://www.theguardian.com/an-articlce") // TODO Correct?
    (singleStoryPanel \ "title").text should be("A headline")
    (singleStoryPanel \ "link").text should be("https://www.theguardian.com/an-article")
    (singleStoryPanel \ "creator").filter(_.prefix == "dc").head.text should be("Trail byline") // TODO should be <author> in Google Showcase docs
    (singleStoryPanel \ "published").filter(_.prefix == "atom").text should be("2021-03-02T12:30:01Z")
    //(singleStoryPanel \ "updated").filter(_.prefix == "atom").text should be("2021-03-02T13:30:01Z")

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
    (rundownArticle \ "guid").text should be("http://www.theguardian.com/a")
    (rundownArticle \ "title").text should be("A title")
    (rundownArticle \ "link").text should be("https://www.theguardian.com/an-article")
    (rundownArticle \ "published").filter(_.prefix == "atom").text should be("2021-03-02T12:30:01Z")
    (rundownArticle \ "updated").filter(_.prefix == "atom").text should be("2021-03-02T13:30:01Z")
  }

  "TrailToShowcase" can "create Single Story panels from single trails" in {
    val curatedContent = makePressedContent(webPublicationDate = Some(wayBackWhen))

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(curatedContent)

    singleStoryPanel.getTitle should be("A headline")
    singleStoryPanel.getAuthor should be ("Trail byline")
    singleStoryPanel.getLink should be ("https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report")

    val gModule = singleStoryPanel.getModule(GModule.URI).asInstanceOf[GModule]
    gModule.getPanel should be(Some("SINGLE_STORY"))
    gModule.getPanelTitle should be(None)
    gModule.getOverline should be(Some("A Kicker"))

    val rssAtomModule = singleStoryPanel.getModule(RssAtomModule.URI).asInstanceOf[RssAtomModule]
    rssAtomModule.getPublished should be(Some(wayBackWhen))
    //rssAtomModule.getUpdated should be(webPublicationDate)  // TODO better value

    // Single panel stories require a media element
    val mediaModule = singleStoryPanel.getModule("http://search.yahoo.com/mrss/").asInstanceOf[MediaEntryModule]
    mediaModule should be(null) // TODO
  }

  "TrailToShowcase" can "create Rundown panels from a group of trials" in {
    // testTrail("a", customTitle = Some("A title"), byline = Some("Trail byline"), webUrl = "https://theguardian.com/an-article",
    // webPublicationDate = Some(wayBackWhen), lastModified = Some(wayBackWhen.plusHours(1))
    val trail = makePressedContent(webPublicationDate = Some(wayBackWhen))
    val anotherTrail = makePressedContent(webPublicationDate = Some(wayBackWhen)) // testTrail("a", customTitle = Some("Another title"), byline = Some("Trail byline"), webUrl = "https://theguardian.com/another-article")

    val content = Seq(trail, anotherTrail)

    val rundownPanel = TrailsToShowcase.asRundownPanel("Rundown container name", content, "rundown-container-id")
    rundownPanel.getLink should be(null)  // TODO
    rundownPanel.getUri should be("rundown-container-id") // Guid for rundown item is the container id.

    val gModule = rundownPanel.getModule(GModule.URI).asInstanceOf[GModule]
    gModule.getPanel should be(Some("RUNDOWN"))
    gModule.getPanelTitle should be(Some("Rundown container name"))

    val articleGroup =  gModule.getArticleGroup.get
    articleGroup.role should be(Some("RUNDOWN"))
    articleGroup.articles.size should be(2)

    val firstItemInArticleGroup: GArticle = articleGroup.articles.head
    firstItemInArticleGroup.title should be("A headline")
    firstItemInArticleGroup.link should be("https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report")
    // firstItemInArticleGroup.guid should be("http://www.theguardian.com/a")
    firstItemInArticleGroup.published should be(wayBackWhen)
    // firstItemInArticleGroup.updated should be(trail.fields.lastModified) TODO
    firstItemInArticleGroup.overline should be(Some("A Kicker"))

    // Rundown panel stories require a media element
    val mediaModule = rundownPanel.getModule("http://search.yahoo.com/mrss/").asInstanceOf[MediaEntryModule]
  }

  private def makePressedContent(webPublicationDate: Option[DateTime]) = {
    val byline = Some("Trail byline")
    val url = "/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report"
    val webUrl = "https://www.theguardian.com/sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report"
    val title = "A title"
    val headline = "A headline"
    val trailText = Some("Some trail text")
    val lastModified = Some(DateTime.now().minusMinutes(30))

    val properties = PressedProperties(
      isBreaking = false,
      showByline = false,
      showKickerTag = false,
      imageSlideshowReplace = false,
      maybeContent = None,
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

    val header = PressedCardHeader(
      isVideo = false,
      isComment = false,
      isGallery = false,
      isAudio = false,
      kicker = Some(FreeHtmlKicker(KickerProperties(kickerText = Some("A Kicker")), "A Kicker body")),
      seriesOrBlogKicker = None,
      headline = headline,
      url = url,
      hasMainVideoElement = None
    )

    val card = PressedCard(
      id = "sport/2016/apr/12/andy-murray-pierre-hugues-herbert-monte-carlo-masters-match-report",
      cardStyle = CardStyle.make(Editorial),
      webPublicationDateOption = webPublicationDate,
      trailText = trailText,
      mediaType = None,
      starRating = None,
      shortUrl = "",
      shortUrlPath = None,
      isLive = true,
      group = ""
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
      cardStyle = CardStyle.make(Editorial)
    )
  }

}
