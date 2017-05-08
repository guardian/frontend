package common.commercial.hosted

import com.gu.contentapi.client.model.v1.ElementType.Image
import com.gu.contentapi.client.model.v1.{Asset, Content, Element}

object ContentUtils {

  private def isRelatedImageElement(relation: String)(element: Element): Boolean =
    element.`type` == Image && element.relation == relation

  def imageElements(item: Content, relation: String): Seq[Element] =
    item.elements.toSeq flatMap (_ filter isRelatedImageElement(relation))

  private def findImageElement(item: Content, relation: String): Option[Element] =
    item.elements flatMap (_ find isRelatedImageElement(relation))

  private def width(asset: Asset): Int = asset.typeData.flatMap(_.width).getOrElse(0)

  private def findSmallestAsset(element: Element): Asset = element.assets.minBy(width)

  def findLargestAsset(element: Element): Asset = element.assets.maxBy(width)

  def findLargestMainImageAsset(item: Content): Option[Asset] =
    findImageElement(item, "main") map findLargestAsset

  def findSmallestThumbnailAsset(item: Content): Option[Asset] =
    findImageElement(item, "thumbnail") map findSmallestAsset
}
