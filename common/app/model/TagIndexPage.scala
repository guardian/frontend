package model

import com.gu.openplatform.contentapi.model.{Tag => ApiTag}
import play.api.libs.json._

object TagDefinition {
  implicit val jsonFormat = Json.format[TagDefinition]

  def fromContentApiTag(apiTag: ApiTag): TagDefinition = TagDefinition(
    apiTag.webTitle,
    apiTag.id
  )
}

/** Minimal amount of information we need to serialize about tags */
case class TagDefinition(
  webTitle: String,
  id: String
)

object TagIndexListing {
  implicit val jsonFormat = Json.format[TagIndexListing]

  def fromTagIndexPage(tagIndexPage: TagIndexPage) =
    TagIndexListing(tagIndexPage.id, tagIndexPage.title)
}

case class TagIndexListing(
  id: String,
  title: String
)

object TagIndexListings {
  implicit val jsonFormat = Json.format[TagIndexListings]

  def fromTagIndexPages(pages: Seq[TagIndexPage]) =
    TagIndexListings(pages.map(TagIndexListing.fromTagIndexPage).sortBy(_.title))
}

case class TagIndexListings(pages: Seq[TagIndexListing])

object TagIndexPage {
  implicit val jsonFormat = Json.format[TagIndexPage]
}

case class TagIndexPage(
  id: String,
  title: String,
  tags: Seq[TagDefinition]
)
