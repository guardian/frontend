package model.commercial

import common.Edition
import common.commercial.{BrandHunter, Branding}
import model.{ContentType, ElementsFormat, ImageElement}
import play.api.libs.json.{Json, Writes}

case class CapiSingle(articleHeadline: String, articleUrl: String,
                      articleText: Option[String], articleImage: Seq[ImageElement],
                      audioTag: Boolean, galleryTag: Boolean,
                      videoTag: Boolean, branding: Option[Branding])

object CapiSingle {
  import ElementsFormat._

  def fromContent(contentType: ContentType): CapiSingle = {
    val content = contentType.content
    val branding = BrandHunter.findContentBranding(contentType, Edition.defaultEdition)

    CapiSingle(content.trail.headline, content.metadata.webUrl, content.trail.fields.trailText, content.elements.images, content.tags.isAudio,
      content.tags.isGallery, content.tags.isVideo, branding)
  }
  implicit val writesCapiSingle: Writes[CapiSingle] = Json.writes[CapiSingle]
}
