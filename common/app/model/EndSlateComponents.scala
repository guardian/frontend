package model

import model.pressed._
import implicits.FaciaContentFrontendHelpers.FaciaContentFrontendHelper

object EndSlateComponents {
  def fromContent(content: Content) = EndSlateComponents(
    content.tags.series collectFirst { case tag: Tag => tag.metadata.id },
    content.metadata.section,
    content.fields.shortUrl
  )

  def fromFaciaContent(faciaContent: PressedContent) = EndSlateComponents(
    faciaContent.series collectFirst { case tag:Tag => tag.metadata.id },
    faciaContent.properties.section,
    faciaContent.card.shortUrl
  )
}

case class EndSlateComponents(
  seriesId: Option[String],
  sectionId: String,
  shortUrl: String
) {
  def toUriPath = {
    val url = seriesId.fold(s"/video/end-slate/section/$sectionId")(id => s"/video/end-slate/series/$id")
    s"$url.json?shortUrl=$shortUrl"
  }
}
