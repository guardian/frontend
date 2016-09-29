package model.commercial

import common.Edition
import common.commercial.{BrandHunter, Branding}
import model.{ContentType, ElementsFormat}
import play.api.libs.json.{Json, Writes}
import CapiImages.ImageInfo

case class CapiSingle(articleHeadline: String, articleUrl: String,
                      articleText: Option[String], articleImage: ImageInfo,
                      audioTag: Boolean, galleryTag: Boolean,
                      videoTag: Boolean, branding: Option[Branding])

object CapiSingle {
  import ElementsFormat._

  def fromContent(contentType: ContentType, noArticles: Int = 1): CapiSingle = {
    val content = contentType.content
    val branding = BrandHunter.findContentBranding(contentType, Edition.defaultEdition)
    val imageInfo = CapiImages.buildImageData(content.trail.trailPicture, noArticles)

    CapiSingle(content.trail.headline, content.metadata.webUrl, content.trail.fields.trailText, imageInfo, content.tags.isAudio,
      content.tags.isGallery, content.tags.isVideo, branding)
  }
  implicit val writesCapiSingle: Writes[CapiSingle] = Json.writes[CapiSingle]
}
