package model

import com.gu.contentapi.client.model.ItemResponse
import slices.{ContainerDefinition, FixedContainers}

case class RelatedContent(
  // A manually curated list of related content. You want to to favour this over `related`
  storyPackage: Seq[Content],

  // Related content worked out by an algorithm
  related: Seq[Content]
) {
  val hasStoryPackage: Boolean = storyPackage.nonEmpty
}

object RelatedContent {
  def apply(parent: Content, item: ItemResponse): RelatedContent = RelatedContent(
    item.storyPackage.map(Content(_)).filterNot(_.id == parent.id),
    item.relatedContent.map(Content(_)).filterNot(_.id == parent.id)
  )
}
