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
import model.Trail
import org.scalatest.{FlatSpec, Matchers}
import org.scalatestplus.play.guice.GuiceOneAppPerSuite
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import com.sun.syndication.feed.module
import com.sun.syndication.feed.module.georss.GMLModuleImpl
import implicits.Dates.jodaToJavaInstant

import java.util.Date
import scala.util.Try
import scala.xml._
import scala.xml.XML

class TrailsToShowcaseTest extends FlatSpec with Matchers with TestTrails {

  val request = FakeRequest()

  "TrailsToShowcase" should "set showcase namespace in feed header" in {
    val trail = testTrail("a", customTitle = Some("A title"), byline = Some("Trail byline"), webUrl = "https://www.theguardian.com/an-article")
    val singleStoryTrails = Seq(trail)

    val rss = XML.loadString(TrailsToShowcase(Option("foo"), singleStoryTrails, Seq.empty, "", "")(request))

    rss.getNamespace("g") should be("http://schemas.google.com/pcn/2020")
  }

  "TrailsToShowcase" can "render feed with Single Story and Rundown panels" in {
    val wayBackWhen = new DateTime(2021, 3, 2, 12, 30, 1)
    val trail = testTrail("a", customTitle = Some("A title"), byline = Some("Trail byline"), webUrl = "https://www.theguardian.com/an-article",
      webPublicationDate = Some(wayBackWhen), lastModified = Some(wayBackWhen.plusHours(1)))
    val singleStoryTrails = Seq(trail)
    val rundownTrails = Seq(trail, trail)

    val rss = XML.loadString(TrailsToShowcase(Option("foo"), singleStoryTrails,
      rundownTrails, "Rundown container title", "rundown-container-id")(request))

    val channelItems = rss \ "channel" \ "item"
    val singleStoryPanels: NodeSeq = channelItems.filter( node => ( node \ "panel").filter(_.prefix == "g").filter(_.text == "SINGLE_STORY").nonEmpty)
    singleStoryTrails.size should be(1)

    val rundownPanels = channelItems.filter( node => ( node \ "panel").filter(_.prefix == "g").filter(_.text == "RUNDOWN").nonEmpty)
    rundownPanels.size should be(1)

    val singleStoryPanel = singleStoryPanels.head
    (singleStoryPanel \ "guid").text should be("http://www.theguardian.com/a")
    (singleStoryPanel \ "title").text should be("A title")
    (singleStoryPanel \ "link").text should be("https://www.theguardian.com/an-article")
    (singleStoryPanel \ "creator").filter(_.prefix == "dc").head.text should be("Trail byline") // TODO should be <author> in Google Showcase docs
    (singleStoryPanel \ "published").filter(_.prefix == "atom").text should be("2021-03-02T12:30:01Z")
    (singleStoryPanel \ "updated").filter(_.prefix == "atom").text should be("2021-03-02T13:30:01Z")

    val rundownPanel = rundownPanels.head
    val rundownPanelGuid = (rundownPanel \ "guid").head
    rundownPanelGuid.text should be("rundown-container-id")
    rundownPanelGuid.attribute("isPermaLink").get.head.text should be("false")

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
    val trail = testTrail("a", customTitle = Some("A title"), byline = Some("Trail byline"), webUrl = "https://theguardian.com/an-article",
      webPublicationDate = Some(DateTime.now().minusHours(8)), lastModified = Some(DateTime.now().minusMinutes(30)))

    val singleStoryPanel = TrailsToShowcase.asSingleStoryPanel(trail)

    singleStoryPanel.getTitle should be("A title")
    singleStoryPanel.getUri should be("http://www.theguardian.com/a")
    singleStoryPanel.getAuthor should be ("Trail byline")
    singleStoryPanel.getLink should be ("https://theguardian.com/an-article")

    singleStoryPanel.getPublishedDate should be(trail.webPublicationDate.toDate)

    val rssAtomModule = singleStoryPanel.getModule(RssAtomModule.URI).asInstanceOf[RssAtomModule]
    rssAtomModule.getPublished should be(Some(trail.webPublicationDate))
    rssAtomModule.getUpdated should be(Some(trail.fields.lastModified))

    val gModule = singleStoryPanel.getModule(GModule.URI).asInstanceOf[GModule]
    gModule.getPanel should be(Some("SINGLE_STORY"))
    gModule.getPanelTitle should be(None)

    // TODO gModule.getOverline should be(Some("Trail text / Kicker"))
  }

  "TrailToShowcase" can "create Rundown panels from a group of trials" in {
    val wayBackWhen = new DateTime(2021, 1, 2, 12, 1, 1)
    val trail = testTrail("a", customTitle = Some("A title"), byline = Some("Trail byline"), webUrl = "https://theguardian.com/an-article",
      webPublicationDate = Some(wayBackWhen), lastModified = Some(wayBackWhen.plusHours(1))
    )
    val anotherTrail = testTrail("a", customTitle = Some("Another title"), byline = Some("Trail byline"), webUrl = "https://theguardian.com/another-article")
    val trails = Seq(trail, anotherTrail)

    val rundownPanel = TrailsToShowcase.asRundownPanel("Rundown container name", trails, "rundown-container-id")
    rundownPanel.getLink should be(null)
    rundownPanel.getUri should be("rundown-container-id")

    val gModule = rundownPanel.getModule(GModule.URI).asInstanceOf[GModule]
    gModule.getPanel should be(Some("RUNDOWN"))
    gModule.getPanelTitle should be(Some("Rundown container name"))

    val articleGroup =  gModule.getArticleGroup.get
    articleGroup.role should be(Some("RUNDOWN"))
    articleGroup.articles.size should be(2)

    val firstItemInArticleGroup: GArticle = articleGroup.articles.head
    firstItemInArticleGroup.title should be("A title")
    firstItemInArticleGroup.link should be("https://theguardian.com/an-article")
    firstItemInArticleGroup.guid should be("http://www.theguardian.com/a")
    firstItemInArticleGroup.published should be(trail.webPublicationDate)
    firstItemInArticleGroup.updated should be(trail.fields.lastModified)

    //TODO firstItemInArticleGroupGModule.getOverline should be(Some("Kicker"))
  }

}
