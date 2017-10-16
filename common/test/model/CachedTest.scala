package model

import java.time.ZoneOffset

import com.gu.contentapi.client.model.v1.{ContentFields, Content => ApiContent}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import conf.switches.Switches.LongCacheSwitch
import implicits.Dates.jodaToJavaInstant
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import org.joda.time.DateTime
import org.scala_tools.time.Imports._
import org.scalatest.{FlatSpec, Matchers}
import play.api.mvc.Results

class CachedTest extends FlatSpec with Matchers with Results with implicits.Dates {

  "Cached" should "cache live content for 5 seconds" in {
    LongCacheSwitch.switchOff()


    val modified = new DateTime(2001, 5, 20, 12, 3, 4, 555)
    val liveContent = content(lastModified = modified, live = true)

    liveContent.metadata.cacheTime.cacheSeconds should be(5)

    val result = Cached(5, WithoutRevalidationResult(Ok("foo")), None)
    val headers = result.header.headers

    headers("Cache-Control") should be("max-age=5, stale-while-revalidate=1, stale-if-error=864000")
  }

  it should "cache content less than 1 hour old for 60 seconds" in {
    LongCacheSwitch.switchOff()

    val modifiedAlmost1HourAgo = DateTime.now - 58.minutes
    val liveContent = content(lastModified = modifiedAlmost1HourAgo, live = false)

    liveContent.metadata.cacheTime.cacheSeconds should be(60)

    val result = Cached(60, WithoutRevalidationResult(Ok("foo")), None)
    val headers = result.header.headers

    headers("Cache-Control") should be("max-age=60, stale-while-revalidate=6, stale-if-error=864000")
  }

  it should "cache older content for 5 minutes" in {
    LongCacheSwitch.switchOff()

    val modifiedLongAgo = DateTime.now - 25.hours
    val liveContent = content(lastModified = modifiedLongAgo, live = false)

    liveContent.metadata.cacheTime.cacheSeconds should be(300)

    val result = Cached(300, WithoutRevalidationResult(Ok("foo")), None)
    val headers = result.header.headers

    headers("Cache-Control") should be("max-age=300, stale-while-revalidate=30, stale-if-error=864000")
  }

  it should "cache other things for 1 minute" in {
    LongCacheSwitch.switchOff()

    val page = SimplePage(MetaData.make(
      id = "",
      section = None,
      webTitle = ""))

    page.metadata.cacheTime.cacheSeconds should be(60)

    val result = Cached(60, WithoutRevalidationResult(Ok("foo")), None)
    val headers = result.header.headers

    headers("Cache-Control") should be("max-age=60, stale-while-revalidate=6, stale-if-error=864000")
  }

  it should "have at least 1 second stale-while-revalidate" in {
    LongCacheSwitch.switchOff()

    val result = Cached(5, WithoutRevalidationResult(Ok("foo")), None)
    val headers = result.header.headers

    headers("Cache-Control") should be("max-age=5, stale-while-revalidate=1, stale-if-error=864000")
  }

  it should "set Surrogate-Control the same as Cache-Control" in {
    LongCacheSwitch.switchOff()

    val result = Cached(60, WithoutRevalidationResult(Ok("foo")), None)
    val headers = result.header.headers

    headers("Cache-Control") should be("max-age=60, stale-while-revalidate=6, stale-if-error=864000")
    headers("Cache-Control") should equal (headers("Surrogate-Control"))
  }

  "Longer cache control" should "be applied to SurrogateControl if enabled" in {
    LongCacheSwitch.switchOn()

    val modifiedLongAgo = DateTime.now - 25.hours
    val liveContent = content(lastModified = modifiedLongAgo, live = false)

    liveContent.metadata.cacheTime.cacheSeconds should be(3800)

    val result = Cached(3800, WithoutRevalidationResult(Ok("foo")), None)
    val headers = result.header.headers

    headers("Surrogate-Control") should be("max-age=3800, stale-while-revalidate=380, stale-if-error=864000")
  }

  it should "limit the max-age to 60" in {
    LongCacheSwitch.switchOn()

    val modifiedLongAgo = DateTime.now - 25.hours
    val liveContent = content(lastModified = modifiedLongAgo, live = false)

    liveContent.metadata.cacheTime.cacheSeconds should be(3800)

    val result = Cached(3800, WithoutRevalidationResult(Ok("foo")), None)
    val headers = result.header.headers

    headers("Cache-Control") should be("max-age=60, stale-while-revalidate=6, stale-if-error=864000")
  }

  "ETags" should "should be added" in {

    val result = Cached(5, RevalidatableResult(Ok("foo"), "A"), None)
    val headers = result.header.headers

    result.header.status should be(200)
    headers("ETag") should be("""W/"hash96"""")

  }

  it should "wrong etag should be ignored" in {
    LongCacheSwitch.switchOff()

    val result = Cached(5, RevalidatableResult(Ok("foo"), "A"), Some("""W/"hasheroo""""))
    val headers = result.header.headers

    result.header.status should be(200)
    headers("ETag") should be("""W/"hash96"""")

  }

  it should "correct etag should not be ignored" in {
    LongCacheSwitch.switchOff()

    val result = Cached(5, RevalidatableResult(Ok("foo"), "A"), Some("""W/"hash96""""))
    val headers = result.header.headers

    result.header.status should be(304)
    headers("ETag") should be("""W/"hash96"""")

  }

  private def content(lastModified: DateTime, live: Boolean) = {

    val offsetWebDate = jodaToJavaInstant(new DateTime()).atOffset(ZoneOffset.UTC)
    val offsetLastModified = jodaToJavaInstant(lastModified).atOffset(ZoneOffset.UTC)

    val content = Content(ApiContent(id = "foo/2012/jan/07/bar",
      sectionId = None,
      sectionName = None,
      webPublicationDate = Some(offsetWebDate.toCapiDateTime),
      webTitle = "Some article",
      webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
      elements = None,
      fields = Some(ContentFields(
        lastModified = Some(offsetLastModified.toCapiDateTime),
        liveBloggingNow = Some(live)))
    ))
    model.SimpleContentPage(content)
  }
}
