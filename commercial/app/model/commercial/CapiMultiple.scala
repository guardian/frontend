package model.commercial

import common.Edition
import common.commercial.{BrandHunter, Branding}
import model.{ContentType, ElementsFormat, ImageElement}
import play.api.libs.json.{Json, Writes}

// The information needed to render the native cAPI multiple ad.
case class CapiMultiple(articles: Seq[CapiSingle])

object CapiMultiple {

  def fromContent(articles: Seq[ContentType]): CapiMultiple = {      

    CapiMultiple(articles.map { article => 

      val content = article.content
      val imageInfo = buildImageData(content.trail.trailPicture)

      CapiSingle(
        content.trail.headline,
        content.metadata.webUrl,
        content.trail.fields.trailText,
        imageInfo,
        content.tags.isAudio,
        content.tags.isGallery,
        content.tags.isVideo
      )

    })

  }

  implicit val writesCapiMultiple: Writes[CapiMultiple] =
      Json.writes[CapiMultiple]

}
