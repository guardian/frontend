package commercial.model.merchandise

import commercial.model.capi.{CapiImages, ImageInfo}
import common.Edition
import model.ContentType
import play.api.libs.json.{Json, Writes}

case class TrafficDriver(
    articleHeadline: String,
    articleUrl: String,
    articleText: Option[String],
    articleImage: ImageInfo,
    edition: String,
)

object TrafficDriver {

  def fromContent(contentType: ContentType, edition: Edition): TrafficDriver = {

    val content = contentType.content
    val imageInfo = CapiImages.buildImageData(content.trail.trailPicture)

    TrafficDriver(
      content.trail.headline,
      content.metadata.webUrl,
      content.trail.fields.trailText,
      imageInfo,
      edition.id,
    )

  }

  implicit val writesTrafficDriver: Writes[TrafficDriver] =
    Json.writes[TrafficDriver]

}
