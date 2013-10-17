package common

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import play.api.Play
import common.editions.Uk

class LinkToTest extends FlatSpec with Matchers {

  Play.unsafeApplication

  implicit val edition = Uk

  object TestLinkTo extends LinkTo {
    override lazy val host = "http://www.foo.com"
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

  it should "strip leading and trailing whitespace" in {
    TestLinkTo("  http://www.foo.com/uk   ", edition) should be ("http://www.foo.com/uk")
  }

}
