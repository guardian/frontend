package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.{CartoonElementFields, CartoonImage}
import model.ImageAsset

object CartoonExtraction {
  def extractCartoon(cartoonElementFields: CartoonElementFields): Option[CartoonBlockElement] = {
    val variants = getCartoonVariants(cartoonElementFields)
    Option.when(cartoonIsValid(variants)) {
      CartoonBlockElement(
        variants = getCartoonVariants(cartoonElementFields),
        role = Role(cartoonElementFields.role, Inline),
        credit = cartoonElementFields.credit,
        caption = cartoonElementFields.caption,
        alt = cartoonElementFields.alt,
        displayCredit = cartoonElementFields.displayCredit,
      )
    }
  }

  private def getCartoonVariants(cartoonData: CartoonElementFields): List[DcrCartoonVariant] = {
    cartoonData.variants
      .map(variants =>
        variants
          .map(variant =>
            DcrCartoonVariant(
              viewportSize = variant.viewportSize,
              images = getImageAssets(variant.images.toList),
            ),
          )
          .toList,
      )
      .getOrElse(List.empty)
  }

  private def getImageAssets(images: List[CartoonImage]): List[ImageAsset] = {
    images.zipWithIndex.map { case (a, i) =>
      ImageAsset.make(a, i)
    }
  }

  private def cartoonIsValid(variants: List[DcrCartoonVariant]): Boolean = {
    variants.exists(variant =>
      variant.viewportSize == "large" &&
        variant.images.nonEmpty &&
        variant.images.head.fields.contains("height") &&
        variant.images.head.fields.contains("width"),
    )
  }
}
