package model

import com.gu.contentapi.client.model.v1.{Content => ApiContent, ContentFields}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichJodaDateTime
import conf.switches.Switches
import conf.switches.Switches.DoubleCacheTimesSwitch
import org.joda.time.DateTime
import org.scala_tools.time.Imports._
import org.scalatest.{FlatSpec, Matchers}
import play.api.mvc.Results

class CachedTest extends FlatSpec with Matchers with Results with implicits.Dates {

  "Cached" should "cache live content for 5 seconds" in {
    Switches.DoubleCacheTimesSwitch.switchOff()

    val modified = new DateTime(2001, 5, 20, 12, 3, 4, 555)
    val liveContent = content(lastModified = modified, live = true)

    val result = Cached(liveContent)(Ok("foo"))
    val headers = result.header.headers

    headers("Cache-Control") should be("max-age=5, stale-while-revalidate=1, stale-if-error=864000")
  }

  it should "cache content less than 1 hour old for 10 seconds" in {
    Switches.DoubleCacheTimesSwitch.switchOff()

    val modifiedAlmost1HourAgo = DateTime.now - 58.minutes
    val liveContent = content(lastModified = modifiedAlmost1HourAgo, live = false)

    val result = Cached(liveContent)(Ok("foo"))
    val headers = result.header.headers

    headers("Cache-Control") should be("max-age=10, stale-while-revalidate=1, stale-if-error=864000")
  }

  it should "cache older content for 5 minutes" in {
    Switches.DoubleCacheTimesSwitch.switchOff()

    val modifiedLongAgo = DateTime.now - 25.hours
    val liveContent = content(lastModified = modifiedLongAgo, live = false)

    val result = Cached(liveContent)(Ok("foo"))
    val headers = result.header.headers

    headers("Cache-Control") should be("max-age=300, stale-while-revalidate=30, stale-if-error=864000")
  }

  it should "cache other things for 1 minute" in {
    Switches.DoubleCacheTimesSwitch.switchOff()

    val page = SimplePage(MetaData.make(
      id = "",
      section = "",
      webTitle = "",
      analyticsName = ""))

    val result = Cached(page)(Ok("foo"))
    val headers = result.header.headers

    headers("Cache-Control") should be("max-age=60, stale-while-revalidate=6, stale-if-error=864000")
  }

  it should "double the cache time if DoubleCacheTimesSwitch is switched on" in {

    DoubleCacheTimesSwitch.switchOn()

    val liveContent = content(lastModified = DateTime.now, live = false)

    val result = Cached(liveContent)(Ok("foo"))
    val headers = result.header.headers

    headers("Cache-Control") should be("max-age=20, stale-while-revalidate=2, stale-if-error=864000")
  }

  it should "have at least 1 second stale-while-revalidate" in {
    DoubleCacheTimesSwitch.switchOff()

    val result = Cached(5)(Ok("foo"))
    val headers = result.header.headers

    headers("Cache-Control") should be("max-age=5, stale-while-revalidate=1, stale-if-error=864000")
  }

  it should "set Surrogate-Control the same as Cache-Control" in {
    Switches.DoubleCacheTimesSwitch.switchOff()

    val page = SimplePage(MetaData.make(
      id = "",
      section = "",
      webTitle = "",
      analyticsName = ""))

    val result = Cached(page)(Ok("foo"))
    val headers = result.header.headers

    headers("Cache-Control") should be("max-age=60, stale-while-revalidate=6, stale-if-error=864000")
    headers("Cache-Control") should equal (headers("Surrogate-Control"))
  }

  private def content(lastModified: DateTime, live: Boolean) = {
    val content = Content(ApiContent(id = "foo/2012/jan/07/bar",
      sectionId = None,
      sectionName = None,
      webPublicationDate = Some(new DateTime().toCapiDateTime),
      webTitle = "Some article",
      webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
      elements = None,
      fields = Some(ContentFields(
        lastModified = Some(lastModified.toCapiDateTime),
        liveBloggingNow = Some(live)))
    ))
    model.SimpleContentPage(content)
  }
}
