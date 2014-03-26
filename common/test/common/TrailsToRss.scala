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


case class TestTrail(url: String) extends Trail {
  def webPublicationDate: DateTime = DateTime.now
  def shortUrl: String = ""
  def linkText: String = ""
  def headline: String = "hello …"
  def webUrl: String = ""
  def trailText: Option[String] = None
  def section: String = ""
  def sectionName: String = ""
  def isLive: Boolean = true
}

}
