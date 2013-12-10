package model

import conf.Switches
import conf.Switches.DoubleCacheTimesSwitch
import org.scalatest.FlatSpec
import org.scalatest.Matchers
import org.joda.time.DateTime
import com.gu.openplatform.contentapi.model.{ Content => ApiContent }
import play.api.mvc.Results
import org.scala_tools.time.Imports._

class CachedTest extends FlatSpec with Matchers with Results {

  "Cached" should "cache live content for 30 seconds" in {
    Switches.DoubleCacheTimesSwitch.switchOff()

    val modified = new DateTime(2001, 5, 20, 12, 3, 4, 555)
    val liveContent = content(lastModified = modified, live = true)

    val result = Cached(liveContent)(Ok("foo"))
    val headers = result.header.headers

    headers("Cache-Control") should be("max-age=30")
  }

  it should "cache content less than 1 hour old for 1 minute" in {
    Switches.DoubleCacheTimesSwitch.switchOff()

    val modifiedAlmost1HourAgo = DateTime.now - 58.minutes
    val liveContent = content(lastModified = modifiedAlmost1HourAgo, live = false)

    val result = Cached(liveContent)(Ok("foo"))
    val headers = result.header.headers

    headers("Cache-Control") should be("max-age=60")
  }

  it should "cache older content for 15 minutes" in {
    Switches.DoubleCacheTimesSwitch.switchOff()

    val modifiedLongAgo = DateTime.now - 25.hours
    val liveContent = content(lastModified = modifiedLongAgo, live = false)

    val result = Cached(liveContent)(Ok("foo"))
    val headers = result.header.headers

    headers("Cache-Control") should be("max-age=900")
  }

  it should "cache other things for 1 minute" in {
    Switches.DoubleCacheTimesSwitch.switchOff()

    val page = new MetaData {
      def id = ""

      def section = ""

      def webTitle = ""

      def analyticsName = ""
    }

    val result = Cached(page)(Ok("foo"))
    val headers = result.header.headers

    headers("Cache-Control") should be("max-age=60")
  }

  it should "double the cache time if DoubleCacheTimesSwitch is switched on" in {

    DoubleCacheTimesSwitch.switchOn()

    val liveContent = content(lastModified = DateTime.now, live = false)

    val result = Cached(liveContent)(Ok("foo"))
    val headers = result.header.headers

    headers("Cache-Control") should be("max-age=120")
  }

  private def content(lastModified: DateTime, live: Boolean): Content = {
    Content(ApiContent("foo/2012/jan/07/bar", None, None, new DateTime, "Some article",
      "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      "http://content.guardianapis.com/foo/2012/jan/07/bar",
      elements = None,
      fields = Some(Map(
        "lastModified" -> lastModified.toISODateTimeNoMillisString,
        "liveBloggingNow" -> live.toString)
      )
    ))
  }
}
