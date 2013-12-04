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
    ((rss \ "channel" \ "title").text) should be("foo | theguardian.com")
  }
  
  "TrailsToRss" should "create an RSS entry per given trail" in {
    val rss = XML.loadString(TrailsToRss(Option("foo"), trails)(request))
    ((rss \ "channel" \ "item").size) should be(2)
  }


case class TestTrail(url: String) extends Trail {
  def webPublicationDate: DateTime = DateTime.now
  def shortUrl: String = ""
  def linkText: String = ""
  def headline: String = ""
  def webUrl: String = ""
  def trailText: Option[String] = None
  def section: String = ""
  def sectionName: String = ""
  def isLive: Boolean = true
}

}
