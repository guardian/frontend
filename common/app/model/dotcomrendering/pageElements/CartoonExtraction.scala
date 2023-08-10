package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.{CartoonElementFields, CartoonImage}
import model.ImageAsset

object CartoonExtraction {
  def extractCartoon(cartoonElementFields: CartoonElementFields): CartoonBlockElement = {
    CartoonBlockElement(
      variants = getCartoonVariants(cartoonElementFields),
      role = Role(cartoonElementFields.role, Inline),
      credit = cartoonElementFields.credit,
      caption = cartoonElementFields.caption,
      alt = cartoonElementFields.alt,
      source = cartoonElementFields.source,
      displayCredit = cartoonElementFields.displayCredit,
      photographer = cartoonElementFields.photographer,
      imageType = cartoonElementFields.imageType
    )
  }

  private def getCartoonVariants(cartoonData: CartoonElementFields): Option[List[DcrCartoonVariant]] = {
    cartoonData.variants.map(variants =>
      variants
        .map(variant =>
          DcrCartoonVariant(
            viewportSize = variant.viewportSize,
            images = getImageAssets(variant.images.toList),
          ),
        )
        .toList,
    )
  }

  private def getImageAssets(images: List[CartoonImage]): List[ImageAsset] = {
    images.zipWithIndex.map {
      case (a, i) => ImageAsset.make(a, i)
    }
  }
}
