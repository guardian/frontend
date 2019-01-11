package navigation.helpers

import org.scalatest.{FlatSpec, Matchers}
import test.TestRequest
import navigation.ReaderRevenueSite.Support
import navigation.UrlHelpers
import navigation.UrlHelpers.{Header, AmpHeader}

class UrlHelpersTest extends FlatSpec with Matchers {

  "getComponentId when called with Support, Header" should "return header_support" in {
    UrlHelpers.getComponentId(Support, Header)(TestRequest()) should be(Some("header_support"))
  }

  "getComponentId when called with Support, AmpHeader" should "return amp_header_support" in {
    UrlHelpers.getComponentId(Support, AmpHeader)(TestRequest()) should be(Some("amp_header_support"))
  }
}
