package common

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import org.joda.time.DateTime
import com.gu.openplatform.contentapi.model.{ Content => ApiContent, Tag => ApiTag }
import play.api.Play
import play.api.mvc.Request
import play.api.test.FakeHeaders
import com.sun.corba.se.pept.transport.InboundConnectionCache

class UrlTest extends FlatSpec with ShouldMatchers {

  Play.unsafeApplication

  val they = it

  "Urls" should "be created relative for articles" in {

    val content = ApiContent("foo/2012/jan/07/bar", None, None, new DateTime, "Some article",
      "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      "http://content.guardianapis.com/foo/2012/jan/07/bar",
      tags = List(tag("type/article"))
    )

    SupportedUrl(content) should be("/foo/2012/jan/07/bar")

    new Content(content).url should be("/foo/2012/jan/07/bar")
  }

  they should "be created relative for galleries" in {

    val content = ApiContent("foo/gallery/2012/jan/07/bar", None, None, new DateTime, "Some article",
      "http://www.guardian.co.uk/foo/gallery/2012/jan/07/bar",
      "http://content.guardianapis.com/foo/gallery/2012/jan/07/bar",
      tags = List(tag("type/gallery"))
    )

    SupportedUrl(content) should be("/foo/gallery/2012/jan/07/bar")

    new Content(content).url should be("/foo/gallery/2012/jan/07/bar")
  }

  they should "be created absolute for unsupported content types" in {

    val content = ApiContent("foo/2012/jan/07/bar", None, None, new DateTime, "Some article",
      "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      "http://content.guardianapis.com/foo/2012/jan/07/bar",
      tags = List(tag("type/interactive"))
    )

    SupportedUrl(content) should be("http://www.guardian.co.uk/foo/2012/jan/07/bar")

    new Content(content).url should be("http://www.guardian.co.uk/foo/2012/jan/07/bar")
  }

  they should "be created relative for tags" in {
    Tag(tag("foo/bar")).url should be("/foo/bar")
  }

  "OriginDomain" should "understand the header set by Nginx that contains the domain" in {
    val request = FakeRequest(Map("X-GU-OriginalServer" -> Seq("servername.com")))
    OriginDomain(request) should be(Some("servername.com"))
  }

  it should "return None if no header" in {
    val request = FakeRequest(Map.empty)
    OriginDomain(request) should be(None)
  }

  "TagLinks" should "link to tags" in {
    val tags = Seq(Tag(tag("profile/john-smith", "John Smith")), Tag(tag("profile/joesoap", "Joe Soap")))

    TagLinks("John Smith and Joe Soap and John Smith Again", tags).text should
      equal("""<a href="/profile/john-smith" data-link-name="auto tag link">John Smith</a> and <a href="/profile/joesoap" data-link-name="auto tag link">Joe Soap</a> and John Smith Again""")
  }

  case class FakeRequest(private val _headers: Map[String, Seq[String]]) extends Request[String] {
    def uri = ""
    def path = ""
    def method = ""
    def queryString = Map.empty[String, Seq[String]]
    def headers = FakeHeaders(_headers)
    def body = ""
    def remoteAddress = ""
  }

  private def tag(id: String, name: String = "") = ApiTag(
    id = id, `type` = "type", webTitle = name, webUrl = "", apiUrl = ""
  )
}
