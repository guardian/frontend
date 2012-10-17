package model

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import org.joda.time.DateTime
import com.gu.openplatform.contentapi.model.{ Content => ApiContent }
import play.api.templates.Html
import play.api.mvc.SimpleResult
import org.scala_tools.time.Imports._

class CachedOkTest extends FlatSpec with ShouldMatchers {

  "CachedOk" should "cache live content for 5 seconds" in {

    val modified = new DateTime(2001, 5, 20, 12, 3, 4, 555)
    val liveContent = content(lastModified = modified, live = true)

    val result = CachedOk(liveContent)(Html("foo")).asInstanceOf[SimpleResult[Html]]
    val headers = result.header.headers

    headers("Cache-Control") should be("must-revalidate, max-age=5")
  }

  it should "cache content less than 24 hours old for 1 minute" in {
    val modifiedAlmost24HoursAgo = (DateTime.now - 23.hours) - 50.minutes
    val liveContent = content(lastModified = modifiedAlmost24HoursAgo, live = false)

    val result = CachedOk(liveContent)(Html("foo")).asInstanceOf[SimpleResult[Html]]
    val headers = result.header.headers

    headers("Cache-Control") should be("must-revalidate, max-age=60")
  }

  it should "cache older content for 15 minutes" in {
    val modifiedLongAgo = DateTime.now - 25.hours
    val liveContent = content(lastModified = modifiedLongAgo, live = false)

    val result = CachedOk(liveContent)(Html("foo")).asInstanceOf[SimpleResult[Html]]
    val headers = result.header.headers

    headers("Cache-Control") should be("must-revalidate, max-age=900")
  }

  it should "cache other things for 1 minute" in {
    val page = new MetaData {
      def canonicalUrl = ""

      def id = ""

      def section = ""

      def apiUrl = ""

      def webTitle = ""
    }

    val result = CachedOk(page)(Html("foo")).asInstanceOf[SimpleResult[Html]]
    val headers = result.header.headers

    headers("Cache-Control") should be("must-revalidate, max-age=60")
  }

  private def content(lastModified: DateTime, live: Boolean): Content = {
    new Content(ApiContent("foo/2012/jan/07/bar", None, None, new DateTime, "Some article",
      "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      "http://content.guardianapis.com/foo/2012/jan/07/bar",
      fields = Some(Map(
        "lastModified" -> lastModified.toISODateTimeNoMillisString,
        "liveBloggingNow" -> live.toString)
      )
    ))
  }
}