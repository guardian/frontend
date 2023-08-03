package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.{CartoonElementFields, CartoonImage, CartoonVariant}
import model.ImageAsset
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class CartoonExtractionTest extends AnyFlatSpec with Matchers {
  "CartoonExtraction" should "transform a cartoon element from Content API" in {
    val cartoonElementFields = CartoonElementFields(
      variants = Some(
        scala.collection.Seq(
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
        ),
      ),
      credit = Some("credit"),
      caption = Some("caption"),
      alt = Some("alt"),
      source = Some("source"),
      displayCredit = Some(true),
    )
    val dcrElement: CartoonBlockElement = CartoonExtraction.extractCartoon(cartoonElementFields)

    dcrElement.variants should be(
      Some(
        List(
          DcrCartoonVariant(
            "large",
            List(
              ImageAsset(
                0,
                Map("height" -> "300", "width" -> "500"),
                "Cartoon",
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
