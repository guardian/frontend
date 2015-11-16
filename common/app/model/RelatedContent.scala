package model

import com.gu.contentapi.client.model.ItemResponse

case class RelatedContent( storyPackage: Seq[ContentType]) {
  val hasStoryPackage: Boolean = storyPackage.nonEmpty
}

object RelatedContent {
  def apply(parent: Content, item: ItemResponse): RelatedContent = RelatedContent(
    item.storyPackage.map(Content(_)).filterNot(_.metadata.id == parent.metadata.id)
  )
}
