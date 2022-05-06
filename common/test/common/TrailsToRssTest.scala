package common

import com.gu.contentapi.client.model.v1.{
  Block,
  BlockAttributes,
  BlockElement,
  Blocks,
  ContentFields,
  ElementType,
  TextElementFields,
  Content => ApiContent,
}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import implicits.Dates.jodaToJavaInstant
import model._
import org.joda.time.DateTime
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.play.guice.GuiceOneAppPerSuite
import play.api.test.FakeRequest

import java.time.ZoneOffset
import java.util.UUID
import scala.util.Try
import scala.xml._

class TrailsToRssTest extends AnyFlatSpec with Matchers with GuiceOneAppPerSuite {

  val request = FakeRequest()

  lazy val content = Seq(
    testContent(
      "a",
      "https://www.theguardian.com/a",
      standfirst = Some("The standfist"),
      body = Some("<p>Paragraph 1</p><p>Paragraph 2</p><p>Paragraph 3</p>"),
      bodyBlockTextElements = Some(Seq("<p>Paragraph 1</p>", "<p>Paragraph 2</p>", "<p>Paragraph 3</p>")),
    ),
    testContent("b", "https://www.theguardian.com/b"),
  )

  "TrailsToRss" should "produce a valid RSS feed" in {
    val rss = XML.loadString(TrailsToRss(Option("foo"), content)(request))
    (rss \ "channel" \ "title").text should be("foo | The Guardian")
  }

  "TrailsToRss" should "create an RSS entry per given trail" in {
    val rss = XML.loadString(TrailsToRss(Option("foo"), content)(request))
    (rss \ "channel" \ "item").size should be(2)
  }

  "TrailsToRss" should "use webUrl as item guid" in {
    val rss = XML.loadString(TrailsToRss(Option("foo"), content)(request))
    val item = (rss \ "channel" \ "item").head
    (item \ "link").text should be("https://www.theguardian.com/a")
    (item \ "guid").text should be("https://www.theguardian.com/a")
  }

  "TrailsToRss" should "produce a item description from each trail made up of the standfirst, an intro extracted from the first 2 paragraphs of the body and a read more prompt" in {
    val rss = XML.loadString(TrailsToRss(Option("foo"), content)(request))
    val firstTrailDescription = (rss \ "channel" \ "item" \ "description").head.text
    firstTrailDescription should be(
      "The standfist<p>Paragraph 1</p><p>Paragraph 2</p> <a href=\"https://www.theguardian.com/a\">Continue reading...</a>",
    )
  }

  "TrailsToRss" should "produce live blog item descriptions which have reasonable sizes similar to normal articles" in {
    val liveblogStandfirst =
      scala.io.Source.fromFile(getClass.getClassLoader.getResource("liveblog-standfirst.html").getFile).mkString
    val liveblogBody =
      scala.io.Source.fromFile(getClass.getClassLoader.getResource("liveblog-body.html").getFile).mkString
    val trail = testContent(
      "a",
      "https://www.theguardian.com/a",
      standfirst = Some(liveblogStandfirst),
      body = Some(liveblogBody),
    )
    val liveblogTrails = Seq(trail)

    val rss = XML.loadString(TrailsToRss(Option("foo"), liveblogTrails)(request))
    val firstTrailDescription = (rss \ "channel" \ "item" \ "description").head.text
    firstTrailDescription.size < 5000 shouldBe (true)
  }

  "TrailsToRss" should "not strip valid Unicode characters from XML" in {
    val rss = XML.loadString(TrailsToRss(Option("foo"), content)(request))
    (rss \\ "item" \\ "title")(1).text should be("hello …")
  }

  it should "strip invalid Unicode characters from XML" in {
    isWellFormedXML(
      TrailsToRss(
        Option("foo"),
        Seq(
          testContent("h", webUrl = "https://www.theguardian.com/h", customTitle = Some("\u0000LOL")),
        ),
      )(request),
    ) shouldBe true
  }

  "TrailsToRss" should "escape special XML characters" in {
    isWellFormedXML(
      TrailsToRss(
        Option("foo"),
        Seq(
          testContent("c", webUrl = "https://www.theguardian.com/c", customTitle = Some("TV & Radio")),
          testContent("d", webUrl = "https://www.theguardian.com/d", customTitle = Some("Scala < Haskell")),
          testContent("e", webUrl = "https://www.theguardian.com/e", customTitle = Some("Scala > JavaScript")),
          testContent("f", webUrl = "https://www.theguardian.com/f", customTitle = Some("Let's get a pizza")),
          testContent("g", webUrl = "https://www.theguardian.com/g", customTitle = Some(""" "No, let's not." """)),
        ),
      )(request),
    ) shouldBe true
  }

  "TrailsToRss" should "should include published date and byline" in {
    val rss = XML.loadString(TrailsToRss(Option("foo"), content)(request))
    (rss \\ "item" \\ "creator").filter(_.prefix == "dc").head.text should be("Chadders")
    (rss \\ "item" \\ "pubDate").size should be(2)
  }

  def isWellFormedXML(s: String): Boolean =
    Try {
      scala.xml.XML.loadString(s)
    }.isSuccess

  private def testContent(
      id: String,
      webUrl: String,
      customTitle: Option[String] = None,
      standfirst: Option[String] = None,
      body: Option[String] = None,
      bodyBlockTextElements: Option[Seq[String]] = None,
  ): Content = {
    val offsetDate = jodaToJavaInstant(new DateTime()).atOffset(ZoneOffset.UTC)

    val blocks = bodyBlockTextElements.map { htmls =>
      textElementRequestedBodyBlocksFor(htmls, "body:oldest:10")
    }

    val contentItem = ApiContent(
      id = id,
      sectionId = None,
      sectionName = None,
      webUrl = webUrl,
      apiUrl = "",
      webPublicationDate = Some(offsetDate.toCapiDateTime),
      elements = None,
      webTitle = customTitle getOrElse "hello …",
      fields = Some(
        ContentFields(liveBloggingNow = Some(true), byline = Some("Chadders"), standfirst = standfirst, body = body),
      ),
      blocks = blocks,
    )
    model.Content(contentItem).content
  }

  private def textElementRequestedBodyBlocksFor(htmls: Seq[String], requestedBlocks: String) = {
    val textElements = htmls.map { html =>
      BlockElement(
        `type` = ElementType.Text,
        textTypeData = Some(
          TextElementFields(
            html = Some(html),
          ),
        ),
      )
    }

    val block = Block(
      id = UUID.randomUUID().toString,
      bodyHtml = "",
      bodyTextSummary = "",
      title = None,
      attributes = BlockAttributes(),
      published = true,
      createdDate = None,
      firstPublishedDate = None,
      publishedDate = None,
      lastModifiedDate = None,
      createdBy = None,
      lastModifiedBy = None,
      elements = textElements,
    )

    val requestedBodyBlocks = Map {
      requestedBlocks -> Seq(block)
    }

    Blocks(body = None, requestedBodyBlocks = Some(requestedBodyBlocks))
  }

}
