package common

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import play.api.test.FakeRequest
import org.joda.time.DateTime
import scala.xml._
import model.Trail

class TrailsToRssTest extends FlatSpec with Matchers {

  val request = FakeRequest()
  val trails = Seq(TestTrail("a"), TestTrail("b"))

  "TrailsToRss" should "produce a valid RSS feed" in {
    val rss = XML.loadString(TrailsToRss(Option("foo"), trails)(request))
    ((rss \ "channel" \ "title").text) should be("foo | The Guardian")
  }

  "TrailsToRss" should "create an RSS entry per given trail" in {
    val rss = XML.loadString(TrailsToRss(Option("foo"), trails)(request))
    ((rss \ "channel" \ "item").size) should be(2)
  }
  
  "TrailsToRss" should "clean invalid XML characters" in {
    val rss = XML.loadString(TrailsToRss(Option("foo"), trails)(request))
    ((rss \\ "item" \\ "title" )(1).text) should be("hello")
  }
  
  "TrailsToRss" should "should include published date and byline" in {
    val rss = XML.loadString(TrailsToRss(Option("foo"), trails)(request))
    ((rss \\ "item" \\ "creator" ).filter(_.prefix == "dc").head.text) should be("Chadders")
    ((rss \\ "item" \\ "pubDate" ).size) should be(2)
  }


case class TestTrail(url: String) extends Trail {
  def webPublicationDate: DateTime = DateTime.now
  def shortUrl: String = ""
  def linkText: String = "hello …"
  def headline: String = ""
  def webUrl: String = ""
  def trailText: Option[String] = None
  def section: String = ""
  def sectionName: String = ""
  def isLive: Boolean = true
  override def byline: Option[String] = Some("Chadders") // this is how I'd like to be remembered
}

}
