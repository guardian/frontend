package model

import com.gu.contentapi.client.model.{Content => ApiContent, ItemResponse}
import model.pressed.PressedContent
import services.FaciaContentConvert

object RelatedContentItem {
  def apply(content: ApiContent) : RelatedContentItem = {
    RelatedContentItem(Content(content), FaciaContentConvert.contentToFaciaContent(content))
  }
}

case class RelatedContentItem (
  content: ContentType,
  faciaContent: PressedContent
)

case class RelatedContent (
  items: Seq[RelatedContentItem]
  ) {
  val hasStoryPackage: Boolean = items.nonEmpty
  val faciaItems: Seq[PressedContent] = items.map(_.faciaContent)
}

object RelatedContent {
  def apply(parent: ContentType, response: ItemResponse): RelatedContent = {
    // It's misleading to use storyPackage here rather than relatedContent. A tidy up should rename this file.
    val items = response.storyPackage.map { item =>
      val frontendContent = Content(item)
      RelatedContentItem(frontendContent, FaciaContentConvert.contentToFaciaContent(item))
    }
    RelatedContent(items.filterNot(_.content.metadata.id == parent.metadata.id))
  }
}
