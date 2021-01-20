package commercial.model.capi

import com.gu.commercial.branding.Branding
import common.Edition
import common.commercial.EditionBranding
import model.ContentType
import play.api.libs.json.{Json, Writes}

case class CapiSingle(
    articleHeadline: String,
    articleUrl: String,
    articleText: Option[String],
    articleImage: ImageInfo,
    audioTag: Boolean,
    galleryTag: Boolean,
    videoTag: Boolean,
    branding: Option[Branding],
    edition: String,
)

object CapiSingle {

  def fromContent(contentType: ContentType, edition: Edition, noArticles: Int = 1): CapiSingle = {

    val content = contentType.content
    val branding = contentType.metadata.commercial.flatMap(_.branding(edition))
    val imageInfo = CapiImages.buildImageData(content.trail.trailPicture, noArticles)

    CapiSingle(
      content.trail.headline,
      content.metadata.webUrl,
      content.trail.fields.trailText,
      imageInfo,
      content.tags.isAudio,
      content.tags.isGallery,
      content.tags.isVideo,
      branding,
      edition.id,
    )
  }

  implicit val writesCapiSingle: Writes[CapiSingle] = {
    implicit val brandingFormat = EditionBranding.brandingFormat
    Json.writes[CapiSingle]
  }
}
