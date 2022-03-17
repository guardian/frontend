package navigation.helpers

import org.scalatest.{WordSpec, Matchers}
import test.TestRequest
import navigation.ReaderRevenueSite.{Support, SupportContribute, SupportSubscribe, SupportGifting, SupporterCTA}
import navigation.UrlHelpers
import navigation.UrlHelpers.{AmpFooter, AmpHeader, Footer, Header}

class UrlHelpersTest extends WordSpec with Matchers {

  "UrlHelpers" can {
    "getComponentId" should {
      "return header_support when called with Support, Header" in {
        UrlHelpers.getComponentId(Support, Header) should be(Some("header_support"))
      }

      "return amp_header_support when called with Support, AmpHeader" in {
        UrlHelpers.getComponentId(Support, AmpHeader) should be(Some("amp_header_support"))
      }

      "return footer_support_contribute when called with SupportContribute, Footer" in {
        UrlHelpers.getComponentId(SupportContribute, Footer) should be(Some("footer_support_contribute"))
      }

      "return amp_footer_support_contribute when called with SupportContribute, AmpFooter" in {
        UrlHelpers.getComponentId(SupportContribute, AmpFooter) should be(
          Some("amp_footer_support_contribute"),
        )
      }

      "return footer_support_subscribe when called with SupportSubscribe, Footer" in {
        UrlHelpers.getComponentId(SupportSubscribe, Footer) should be(Some("footer_support_subscribe"))
      }

      "return footer_support_gifting when called with SupportGifting, Footer" in {
        UrlHelpers.getComponentId(SupportGifting, Footer) should be(Some("footer_support_gifting"))
      }

      "return footer_supporter_cta when called with SupporterCTA, Footer" in {
        UrlHelpers.getComponentId(SupporterCTA, Footer) should be(Some("footer_supporter_cta"))
      }

      "return amp_footer_support_subscribe when called with SupportSubscribe, AmpFooter" in {
        UrlHelpers.getComponentId(SupportSubscribe, AmpFooter) should be(
          Some("amp_footer_support_subscribe"),
        )
      }

      "return amp_footer_support_gifting when called with SupportGifting, AmpFooter" in {
        UrlHelpers.getComponentId(SupportGifting, AmpFooter) should be(
          Some("amp_footer_support_gifting"),
        )
      }

      "return amp_footer_supporter_cta when called with SupporterCTA, AmpFooter" in {
        UrlHelpers.getComponentId(SupporterCTA, AmpFooter) should be(
          Some("amp_footer_supporter_cta"),
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

    "getReaderRevenueUrl" should {
      "correctly parse urls with double quotes" in {
        UrlHelpers.getReaderRevenueUrl(SupportSubscribe, Footer) should include("%22")
      }
    }
  }
}
