package common.commercial.hosted

import com.gu.contentapi.client.model.v1.ElementType.Image
import com.gu.contentapi.client.model.v1.{Asset, Content, Element}
import conf.Configuration
import model.{ImageMedia, Element => ModelElement}
import views.support.Item300

object ContentUtils {

  private def isRelatedImageElement(relation: String)(element: Element): Boolean =
    element.`type` == Image && element.relation == relation

  def imageElements(item: Content, relation: String): Seq[Element] =
    item.elements.toSeq flatMap (_ filter isRelatedImageElement(relation))

  private def findImageElement(item: Content, relation: String): Option[Element] =
    item.elements flatMap (_ find isRelatedImageElement(relation))

  def findLargestAsset(element: Element): Asset = {
    def width(asset: Asset): Int = asset.typeData.flatMap(_.width).getOrElse(0)
    element.assets.maxBy(width)
  }

  def findLargestMainImageAsset(item: Content): Option[Asset] =
    findImageElement(item, "main") map findLargestAsset

  private def imageMedia(item: Content): ImageMedia =
    item.elements map { elements =>
      val assets = elements.zipWithIndex flatMap {
        case (element, i) => ModelElement(element, i).images.allImages
      }
      ImageMedia(assets)
    } getOrElse ImageMedia(Nil)

  def thumbnailUrl(item: Content): String =
    Item300.bestSrcFor(imageMedia(item)) getOrElse ""

  def imageForSocialShare(content: Content): String = {
    findLargestMainImageAsset(content)
      .flatMap(_.file)
      .getOrElse(Configuration.images.fallbackLogo)
  }
}
