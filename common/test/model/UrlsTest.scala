package model

import com.gu.openplatform.contentapi.model.{ Content => ApiContent, Tag => ApiTag }
import org.joda.time.DateTime
import org.scalatest.FlatSpec
import org.scalatest.Matchers
import play.api.Play
import play.api.mvc.Request
import play.api.test.FakeHeaders

class UrlsTest extends FlatSpec with Matchers {

  Play.unsafeApplication

  "Urls" should "be created relative for articles" in {

    val content = ApiContent("foo/2012/jan/07/bar", None, None, new DateTime, "Some article",
      "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      "http://content.guardianapis.com/foo/2012/jan/07/bar",
      tags = List(tag("type/article")),
      elements = None
    )

    SupportedUrl(content) should be("/foo/2012/jan/07/bar")

    Content(content).url should be("/foo/2012/jan/07/bar")
  }

  they should "be created relative for galleries" in {

    val content = ApiContent("foo/gallery/2012/jan/07/bar", None, None, new DateTime, "Some article",
      "http://www.guardian.co.uk/foo/gallery/2012/jan/07/bar",
      "http://content.guardianapis.com/foo/gallery/2012/jan/07/bar",
      tags = List(tag("type/gallery")),
      elements = None
    )

    SupportedUrl(content) should be("/foo/gallery/2012/jan/07/bar")

    Content(content).url should be("/foo/gallery/2012/jan/07/bar")
  }

  they should "be created relative for tags" in {
    Tag(tag("foo/bar")).url should be("/foo/bar")
  }

  case class FakeRequest(private val _headers: Map[String, Seq[String]]) extends Request[String] {
    def uri = ""

    def path = ""

    def method = ""

    def queryString = Map.empty[String, Seq[String]]

    def headers = FakeHeaders(_headers.toSeq)

    def body = ""

    def remoteAddress = ""

    def id: Long = 0L

    def tags: Map[String,String] = Map.empty

    def version: String = ""
  }

  private def tag(id: String, name: String = "") = ApiTag(
    id = id, `type` = "type", webTitle = name, webUrl = "", apiUrl = ""
  )
}