package common

import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.Play
import common.editions.Uk
import play.api.mvc.RequestHeader
import test._
import play.api.test.FakeRequest

class LinkToTest extends FlatSpec with Matchers with implicits.FakeRequests {

  Play.unsafeApplication

  implicit val edition = Uk
  implicit val request = FakeRequest("GET", "/")

  object TestLinkTo extends LinkTo {
    override lazy val host = "http://www.foo.com"
  }

  object TheGuardianLinkTo extends LinkTo {
    override lazy val host = "http://www.theguardian.com"
  }

  "LinkTo" should "leave 'other' urls unchanged" in {
    val otherUrl = "http://somewhere.com/foo/bar.html?age=7#TOP"
    TestLinkTo(otherUrl, edition) should be (otherUrl)
  }

  it should "modify the host of Guardian urls" in {
    TestLinkTo("http://www.theguardian.com/foo/bar.html?age=7#TOP", edition) should be ("http://www.foo.com/foo/bar.html?age=7#TOP")
  }

  it should "editionalise the front url" in {
    TestLinkTo("http://www.theguardian.com", edition) should be ("http://www.foo.com/uk")
  }

  it should "editionalise the front path" in {
    TestLinkTo("/", edition) should be ("http://www.foo.com/uk")
  }

  it should "not modify protocol relative paths" in {
    TestLinkTo("//www.youtube.com/embed/jLoG-fNir0c?enablejsapi=1&version=3", edition) should be ("//www.youtube.com/embed/jLoG-fNir0c?enablejsapi=1&version=3")
  }

  it should "strip leading and trailing whitespace" in {
    TestLinkTo("  http://www.foo.com/uk   ", edition) should be ("http://www.foo.com/uk")
  }

  it should "link to section and not the 'section tag'" in {
    TestLinkTo("http://www.theguardian.com/books/books", edition) should be ("http://www.foo.com/books")
    TestLinkTo("/books/books", edition) should be ("http://www.foo.com/books")
    TestLinkTo("/books-23-f/books-23-f", edition) should be ("http://www.foo.com/books-23-f")
  }

  it should "general a editionalised RSS path" in {
    // editionalised
    TestLinkTo("/commentisfree/rss", edition) should be ("http://www.foo.com/uk/commentisfree/rss")
    TestLinkTo("/rss", edition) should be ("http://www.foo.com/uk/rss")
    // not editionalised
    TestLinkTo("/football/rss", edition) should be ("http://www.foo.com/football/rss")
  }

  it should "be protocol relative on https enabled sections" in {
    TheGuardianLinkTo("/info/hello", edition) should be ("//www.theguardian.com/info/hello")
    TheGuardianLinkTo("http://www.theguardian.com/info", edition) should be ("//www.theguardian.com/info")
    TheGuardianLinkTo("/info/foo", edition) should be ("//www.theguardian.com/info/foo")
  }

  object TestCanonicalLink extends CanonicalLink {
    override lazy val secureApp: Boolean = false
  }

  "CanonicalLink" should "be the gatekeeper for significant parameters" in {
    /*

    If you are reading this you have probably added a new parameter to the application.
    Before doing this you need to understand the implications this has on caching and SEO.

    This is not to stop you adding parameters, it is here to make you think before doing so.

    Please read and understand the following...

    http://support.google.com/webmasters/bin/answer.py?hl=en&answer=1235687

    Make sure you have done everything necessary before releasing a new parameter.

    Make sure you have discussed what you want to do with the team.

    You might need to modify the CDN to accept your new parameter.

    */

    TestCanonicalLink.significantParams should be (Seq("index", "page"))

  }

  it should "create a simple canonical url" in {
    TestCanonicalLink(TestRequest("/foo").withHost("www.somewhere.com"), "http://www.somewhere.com/foo") should be ("http://www.somewhere.com/foo")
  }

  it should "ignore insignificant params" in {
    TestCanonicalLink(TestRequest("/foo?view=mobile").withHost("www.somewhere.com"), "http://www.somewhere.com/foo") should be ("http://www.somewhere.com/foo")
  }

  it should "include significant params" in {
    TestCanonicalLink(TestRequest("/foo?page=3").withHost("www.somewhere.com"), "http://www.somewhere.com/foo") should be ("http://www.somewhere.com/foo?page=3")
    TestCanonicalLink(TestRequest("/foo?index=2").withHost("www.somewhere.com"), "http://www.somewhere.com/foo") should be ("http://www.somewhere.com/foo?index=2")
    TestCanonicalLink(TestRequest("/foo?page=3&index=1").withHost("www.somewhere.com"), "http://www.somewhere.com/foo") should be ("http://www.somewhere.com/foo?index=1&page=3")
    TestCanonicalLink(TestRequest("/foo?page=3&random=55&index=1").withHost("www.somewhere.com"), "http://www.somewhere.com/foo") should be ("http://www.somewhere.com/foo?index=1&page=3")
  }

  it should "escape params" in {
    TestCanonicalLink(TestRequest("/foo?page=http://www.theguardian.com").withHost("www.somewhere.com"), "http://www.somewhere.com/foo") should be ("http://www.somewhere.com/foo?page=http%3A%2F%2Fwww.theguardian.com")
  }

  it should "link to https for https sections" in {
    TestCanonicalLink(TestRequest("/info/foo").withHost("www.theguardian.com"), "http://www.theguardian.com/info/foo") should be ("https://www.theguardian.com/info/foo")
  }
}
