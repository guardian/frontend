package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.{CartoonElementFields, CartoonImage, CartoonVariant}
import model.ImageAsset
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import model.dotcomrendering.pageElements.CartoonExtraction._

class CartoonExtractionTest extends AnyFlatSpec with Matchers {
  val validCartoonVariant = CartoonVariant(
    viewportSize = "large",
    images = scala.collection.Seq(
      CartoonImage(
        mimeType = "image/jpeg",
        file = "https://link-to-my-image",
        width = Some(500),
        height = Some(300),
      ),
    ),
  )

  val invalidCartoonVariant = CartoonVariant(
    viewportSize = "large",
    images = scala.collection.Seq(
      CartoonImage(
        mimeType = "image/jpeg",
        file = "https://link-to-my-image",
      ),
    ),
  )

  def cartoonElementFields(variant: CartoonVariant) =
    Some(
      CartoonElementFields(
        variants = Some(scala.collection.Seq(variant)),
        credit = Some("credit"),
        caption = Some("caption"),
        alt = Some("alt"),
        displayCredit = Some(true),
      ),
    )

  "CartoonExtraction" should "transform a cartoon element from Content API" in {
    val dcrElement: CartoonBlockElement = cartoonElementFields(validCartoonVariant).flatMap(extractCartoon).get

    dcrElement.variants should be(
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
    )
    dcrElement.role should be(Inline)
    dcrElement.credit should be(Some("credit"))
    dcrElement.caption should be(Some("caption"))
    dcrElement.alt should be(Some("alt"))
    dcrElement.displayCredit should be(Some(true))
  }

  it should "filter out invalid cartoon elements" in {
    val dcrElement: Option[CartoonBlockElement] = cartoonElementFields(invalidCartoonVariant).flatMap(extractCartoon)
    dcrElement should be(None)
  }
}
