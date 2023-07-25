package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.EmbedTracksType.{DoesNotTrack, EnumUnknownEmbedTracksType, Tracks, Unknown}
import com.gu.contentapi.client.model.v1._
import model.dotcomrendering.pageElements.PageElement.{cartoonToPageElement, containsThirdPartyTracking}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class PageElementTest extends AnyFlatSpec with Matchers {
  "PageElement" should "classify capi tracking value correctly" in {
    containsThirdPartyTracking(None) should equal(false)
    containsThirdPartyTracking(Some(EmbedTracking(DoesNotTrack))) should equal(false)
    containsThirdPartyTracking(Some(EmbedTracking(Tracks))) should equal(true)
    containsThirdPartyTracking(Some(EmbedTracking(Unknown))) should equal(true)
    containsThirdPartyTracking(Some(EmbedTracking(EnumUnknownEmbedTracksType(99)))) should equal(true)
  }

  "PageElement" should "transform a cartoon element from Content API" in {
    val variants = scala.collection.Seq(
      CartoonVariant(
        viewportSize = "large",
        images = scala.collection.Seq(CartoonImage(mimeType = "image/jpeg", file = "https://link-to-my-image")),
      ),
    )
    val contentApiElement = BlockElement(
      `type` = ElementType.Cartoon,
      cartoonTypeData = Some(
        CartoonElementFields(
          cartoonVariants = Some(variants),
          role = Some("role"),
          credit = Some("credit"),
          caption = Some("caption"),
          alt = Some("alt"),
          source = Some("source"),
          displayCredit = Some(true),
        ),
      ),
    )
    val dcrElement: CartoonBlockElement = cartoonToPageElement(contentApiElement).get

    dcrElement.cartoonVariants should be(Some(variants.toList))
    dcrElement.role should be(Some("role"))
    dcrElement.credit should be(Some("credit"))
    dcrElement.caption should be(Some("caption"))
    dcrElement.alt should be(Some("alt"))
    dcrElement.source should be(Some("source"))
    dcrElement.displayCredit should be(Some(true))
  }
}
