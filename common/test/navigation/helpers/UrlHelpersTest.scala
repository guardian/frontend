package navigation.helpers

import org.scalatest.{WordSpec, Matchers}
import test.TestRequest
import navigation.ReaderRevenueSite.{Support, SupportContribute, SupportSubscribe}
import navigation.UrlHelpers
import navigation.UrlHelpers.{AmpFooter, AmpHeader, Footer, Header}

class UrlHelpersTest extends WordSpec with Matchers {

  "UrlHelpers" can {
    "getComponentId" should {
      "return header_support when called with Support, Header" in {
        UrlHelpers.getComponentId(Support, Header)(TestRequest()) should be(Some("header_support"))
      }

      "return amp_header_support when called with Support, AmpHeader" in {
        UrlHelpers.getComponentId(Support, AmpHeader)(TestRequest()) should be(Some("amp_header_support"))
      }

      "return footer_support_contribute when called with SupportContribute, Footer" in {
        UrlHelpers.getComponentId(SupportContribute, Footer)(TestRequest()) should be(Some("footer_support_contribute"))
      }

      "return amp_footer_support_contribute when called with SupportContribute, AmpFooter" in {
        UrlHelpers.getComponentId(SupportContribute, AmpFooter)(TestRequest()) should be(
          Some("amp_footer_support_contribute"),
        )
      }

      "return footer_support_subscribe when called with SupportSubscribe, Footer" in {
        UrlHelpers.getComponentId(SupportSubscribe, Footer)(TestRequest()) should be(Some("footer_support_subscribe"))
      }

      "return amp_footer_support_subscribe when called with SupportSubscribe, AmpFooter" in {
        UrlHelpers.getComponentId(SupportSubscribe, AmpFooter)(TestRequest()) should be(
          Some("amp_footer_support_subscribe"),
        )
      }
    }

    "getComponentType" should {
      "return ACQUISITIONS_HEADER when called with Header" in {
        UrlHelpers.getComponentType(Header) should be("ACQUISITIONS_HEADER")
      }

      "return ACQUISITIONS_HEADER when called with AmpHeader" in {
        UrlHelpers.getComponentType(AmpHeader) should be("ACQUISITIONS_HEADER")
      }

      "return ACQUISITIONS_FOOTER when called with Footer" in {
        UrlHelpers.getComponentType(Footer) should be("ACQUISITIONS_FOOTER")
      }

      "return ACQUISITIONS_FOOTER when called with AmpFooter" in {
        UrlHelpers.getComponentType(AmpFooter) should be("ACQUISITIONS_FOOTER")
      }
    }
  }
}
