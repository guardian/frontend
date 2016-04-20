package common

import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}
import org.scalatestplus.play.OneAppPerSuite
import play.api.test.FakeRequest
import com.gu.contentapi.client.model.v1.{Content => ApiContent, ContentFields}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichJodaDateTime

import scala.util.Try
import scala.xml._

class TrailsToRssTest extends FlatSpec with Matchers with OneAppPerSuite {

  val request = FakeRequest()
  lazy val trails = Seq(testTrail("a"), testTrail("b"))

  "TrailsToRss" should "produce a valid RSS feed" in {
    val rss = XML.loadString(TrailsToRss(Option("foo"), trails)(request))
    (rss \ "channel" \ "title").text should be("foo | The Guardian")
  }

  "TrailsToRss" should "create an RSS entry per given trail" in {
    val rss = XML.loadString(TrailsToRss(Option("foo"), trails)(request))
    (rss \ "channel" \ "item").size should be(2)
  }

  "TrailsToRss" should "not strip valid Unicode characters from XML" in {
    val rss = XML.loadString(TrailsToRss(Option("foo"), trails)(request))
    (rss \\ "item" \\ "title" )(1).text should be("hello …")
  }

  it should "strip invalid Unicode characters from XML" in {
    isWellFormedXML(TrailsToRss(Option("foo"), Seq(
      testTrail("h", customTitle = Some("\u0000LOL"))
    ))(request)) shouldBe true
  }

  "TrailsToRss" should "escape special XML characters" in {
    isWellFormedXML(TrailsToRss(Option("foo"), Seq(
      testTrail("c", customTitle = Some("TV & Radio")),
      testTrail("d", customTitle = Some("Scala < Haskell")),
      testTrail("e", customTitle = Some("Scala > JavaScript")),
      testTrail("f", customTitle = Some("Let's get a pizza")),
      testTrail("g", customTitle = Some(""" "No, let's not." """))
    ))(request)) shouldBe true
  }

  "TrailsToRss" should "should include published date and byline" in {
    val rss = XML.loadString(TrailsToRss(Option("foo"), trails)(request))
    (rss \\ "item" \\ "creator" ).filter(_.prefix == "dc").head.text should be("Chadders")
    (rss \\ "item" \\ "pubDate" ).size should be(2)
  }

  def isWellFormedXML(s: String) =
    Try {
      scala.xml.XML.loadString(s)
    }.isSuccess

  def testTrail(url: String, customTitle: Option[String] = None) = {

    val contentItem = ApiContent(
      id = url,
      sectionId = None,
      sectionName = None,
      webUrl = "",
      apiUrl = "",
      webPublicationDate = Some(new DateTime().toCapiDateTime),
      elements = None,
      webTitle = customTitle getOrElse "hello …",
      fields = Some(ContentFields(
        liveBloggingNow = Some(true),
        byline = Some("Chadders")))
    )
    model.Content(contentItem).trail
  }

}
