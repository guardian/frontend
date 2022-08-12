package model

import com.gu.contentapi.client.model.v1.{Content => ApiContent, ItemResponse}
import model.pressed.PressedContent
import services.FaciaContentConvert

object RelatedContentItem {
  def apply(content: ApiContent): RelatedContentItem = {
    RelatedContentItem(Content(content), FaciaContentConvert.contentToFaciaContent(content))
  }
}

case class RelatedContentItem(
    content: ContentType,
    faciaContent: PressedContent,
)

case class RelatedContent(items: Seq[RelatedContentItem]) {
  val hasStoryPackage: Boolean = items.nonEmpty
  val faciaItems: Seq[PressedContent] = items.map(_.faciaContent)
}

object StoryPackages {
  def apply(parentID: String, response: ItemResponse): RelatedContent = {

    val storyPackagesContent: Seq[ApiContent] = response.packages
      .map { packages =>
        val allContentsPerPackage: Seq[Seq[ApiContent]] = packages.map(_.articles.map(_.content).toSeq).toSeq
        if (packages.size > 1) { //intermix packages only if more than one
          allContentsPerPackage
            .flatMap(_.zipWithIndex) // zip content with its position
            .groupBy(_._1.id)
            .map(_._2.head)
            .toSeq // remove duplicates (Note: not using `distinct` here that would require
            // hashing/comparing the whole ApiContent object but instead grouping based on `id`
            // and then collecting the first element of each group of duplicates)
            .sortBy(_._2)
            .map(_._1) // sort by position and extract content
        } else {
          allContentsPerPackage.flatten
        }
      }
      .getOrElse(List.empty)

    val items = storyPackagesContent.map { item =>
      val frontendContent = Content(item)
      RelatedContentItem(frontendContent, FaciaContentConvert.contentToFaciaContent(item))
    }
    RelatedContent(items.filterNot(_.content.metadata.id == parentID))
  }
}
