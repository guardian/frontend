package model

import implicits.FaciaContentFrontendHelpers.FaciaContentFrontendHelper
import model.pressed._

object EndSlateComponents {
  def fromContent(content: Content): EndSlateComponents = EndSlateComponents(
    content.tags.series collectFirst { case tag: Tag => tag.metadata.id },
    content.metadata.sectionId,
    content.fields.shortUrl
  )

  def fromFaciaContent(faciaContent: PressedContent): EndSlateComponents = EndSlateComponents(
    faciaContent.series collectFirst { case tag:Tag => tag.metadata.id },
    faciaContent.properties.maybeContent.flatMap(_.metadata.sectionId.map(_.value)).getOrElse(""),
    faciaContent.card.shortUrl
  )
}

case class EndSlateComponents(
  seriesId: Option[String],
  sectionId: String,
  shortUrl: String
) {
  def toUriPath: String = {
    val url = seriesId.fold(s"/video/end-slate/section/$sectionId")(id => s"/video/end-slate/series/$id")
    s"$url.json?shortUrl=$shortUrl"
  }
}
