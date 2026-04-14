package model.hosted

import com.gu.contentapi.client.model.v1.Content
import com.gu.contentapi.client.utils.CapiModelEnrichment.RenderingFormat
import model.ContentFormat
import play.api.libs.json.{Json, OWrites}

case class HostedTrailImage(
    src: String,
    alt: String,
)
object HostedTrailImage {
  implicit val hostedTrailImageWrites: OWrites[HostedTrailImage] = Json.writes[HostedTrailImage]
}
case class HostedTrail(
    url: String,
    image: HostedTrailImage,
    headline: String,
    format: ContentFormat,
)
object HostedTrail {
  implicit val hostedTrailWrites: OWrites[HostedTrail] = Json.writes[HostedTrail]
}

object HostedOnwardTrails {
  private def publishedDateTime(item: Content): Long = item.webPublicationDate.map(_.dateTime).getOrElse(0L)

  def fromContent(itemId: String, results: Seq[Content]): Seq[Content] =
    results filterNot (_.id == itemId) sortBy publishedDateTime

  def contentToHostedTrail(content: Content): Option[HostedTrail] = {
    val contentFormat: ContentFormat = ContentFormat(content.design, content.theme, content.display)
    for {
      fields <- content.fields
      headline <- fields.headline
      thumbnail <- fields.thumbnail
    } yield HostedTrail(
      url = content.webUrl,
      image = HostedTrailImage(src = thumbnail, alt = ""),
      format = contentFormat,
      headline = headline,
    )
  }
}
