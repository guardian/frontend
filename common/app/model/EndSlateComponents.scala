package model

import com.gu.facia.api.models.FaciaContent
import implicits.FaciaContentImplicits._

object EndSlateComponents {
  def fromContent(content: Content) = EndSlateComponents(
    content.tags.series collectFirst { case tag: Tag => tag.metadata.id },
    content.metadata.section,
    content.fields.shortUrl
  )

  def fromFaciaContent(faciaContent: FaciaContent) = EndSlateComponents(
    faciaContent.series map ( Tag.make(_) ) collectFirst { case tag:Tag => tag.metadata.id },
    faciaContent.section,
    faciaContent.shortUrl
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
