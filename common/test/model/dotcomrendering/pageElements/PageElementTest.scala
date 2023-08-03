package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.EmbedTracksType.{DoesNotTrack, EnumUnknownEmbedTracksType, Tracks, Unknown}
import com.gu.contentapi.client.model.v1._
import model.dotcomrendering.pageElements.PageElement.{cartoonToPageElement, containsThirdPartyTracking}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import model.ImageAsset

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
        images = scala.collection.Seq(
          CartoonImage(
            mimeType = "image/jpeg",
            file = "https://link-to-my-image",
            width = Some(500),
            height = Some(300),
          ),
        ),
      ),
    )
    val contentApiElement = BlockElement(
      `type` = ElementType.Cartoon,
      cartoonTypeData = Some(
        CartoonElementFields(
          variants = Some(variants),
          credit = Some("credit"),
          caption = Some("caption"),
          alt = Some("alt"),
          source = Some("source"),
          displayCredit = Some(true),
        ),
      ),
    )
    val dcrElement: CartoonBlockElement = cartoonToPageElement(contentApiElement).get

    dcrElement.variants should be(
      Some(
        List(
          DcrCartoonVariant(
            "large",
            List(
              ImageAsset(
                0,
                Map("height" -> "300", "width" -> "500"),
                "image",
                Some("image/jpeg"),
                Some("https://link-to-my-image"),
              ),
            ),
          ),
        ),
      ),
    )
    dcrElement.role should be(Inline)
    dcrElement.credit should be(Some("credit"))
    dcrElement.caption should be(Some("caption"))
    dcrElement.alt should be(Some("alt"))
    dcrElement.source should be(Some("source"))
    dcrElement.displayCredit should be(Some(true))
  }
}
