package model

import com.gu.contentapi.client.model.v1.{Content => ApiContent, ItemResponse}
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

case class RelatedContent ( items: Seq[RelatedContentItem], storyPackagesCount: Int = 0) {
  val hasStoryPackage: Boolean = items.nonEmpty
  val faciaItems: Seq[PressedContent] = items.map(_.faciaContent)
}

object RelatedContent {
  def apply(parent: ContentType, response: ItemResponse): RelatedContent = {
    // It's misleading to use storyPackage here rather than relatedContent. A tidy up should rename this object
    val storyPackagesContent = response.packages.map { packages =>
      packages.flatMap { p =>
        p.articles.map(_.content)
      }
    }.getOrElse(List.empty)

    val items = storyPackagesContent.map { item =>
      val frontendContent = Content(item)
      RelatedContentItem(frontendContent, FaciaContentConvert.contentToFaciaContent(item))
    }
    RelatedContent(items.filterNot(_.content.metadata.id == parent.metadata.id))
  }
}

object StoryPackages {
  def apply(parent: ContentType, response: ItemResponse): RelatedContent = {
    val storyPackagesContent = response.packages.map { packages =>
      packages.map { p =>
        p.articles.map(_.content)
      }
       .flatMap(_.zipWithIndex) // zip content with its position
       .sortBy(_._2).map(_._1) // sort by position and extract content to intermix stories from all packages
       .distinct // remove duplicates
    }.getOrElse(List.empty)

    val items = storyPackagesContent.map { item =>
      val frontendContent = Content(item)
      RelatedContentItem(frontendContent, FaciaContentConvert.contentToFaciaContent(item))
    }
    RelatedContent(items.filterNot(_.content.metadata.id == parent.metadata.id), response.packages.fold(0)(_.size))
  }
}
