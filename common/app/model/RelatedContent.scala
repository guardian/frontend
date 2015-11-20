package model

import com.gu.contentapi.client.model.ItemResponse
import com.gu.facia.api.models.FaciaContent
import services.FaciaContentConvert

case class RelatedContentItem (
  content: ContentType,
  faciaContent: FaciaContent
)

case class RelatedContentPackage private (
  items: Seq[RelatedContentItem]
  ) {
  val hasStoryPackage: Boolean = items.nonEmpty
  val faciaItems: Seq[FaciaContent] = items.map(_.faciaContent)
}

object RelatedContentPackage {
  def apply(parent: ContentType, response: ItemResponse): RelatedContentPackage = {
    val items = response.storyPackage.map { item =>
      val frontendContent = Content(item)
      RelatedContentItem(frontendContent, FaciaContentConvert.contentToFaciaContent(item))
    }
    RelatedContentPackage(items.filterNot(_.content.metadata.id == parent.metadata.id))
  }
}
