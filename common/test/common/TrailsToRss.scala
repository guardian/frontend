package common

import model.Trail
import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}
import play.api.test.FakeRequest

import scala.util.Try
import scala.xml._

class TrailsToRssTest extends FlatSpec with Matchers {

  val request = FakeRequest()
  val trails = Seq(TestTrail("a"), TestTrail("b"))

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
      TestTrail("h", customTitle = Some("\u0000LOL"))
    ))(request)) shouldBe true
  }

  "TrailsToRss" should "escape special XML characters" in {
    isWellFormedXML(TrailsToRss(Option("foo"), Seq(
      TestTrail("c", customTitle = Some("TV & Radio")),
      TestTrail("d", customTitle = Some("Scala < Haskell")),
      TestTrail("e", customTitle = Some("Scala > JavaScript")),
      TestTrail("f", customTitle = Some("Let's get a pizza")),
      TestTrail("g", customTitle = Some(""" "No, let's not." """))
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

  case class TestTrail(url: String, customTitle: Option[String] = None) extends Trail {
    def webPublicationDate: DateTime = DateTime.now
    def shortUrl: String = ""
    def linkText: String = customTitle getOrElse "hello …"
    def headline: String = ""
    def webUrl: String = ""
    def trailText: Option[String] = None
    def section: String = ""
    def sectionName: String = ""
    def isLive: Boolean = true
    override def byline: Option[String] = Some("Chadders") // this is how I'd like to be remembered

    val snapUri: Option[String] = None
    val snapType: Option[String] = None
  }

}
