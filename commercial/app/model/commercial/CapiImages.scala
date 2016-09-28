package model.commercial

import views.support.ImgSrc
import cards.Standard
import layout.{FaciaWidths, ItemClasses}
import model.ImageMedia
import play.api.libs.json.{Json, Writes}

object CapiImages {

  // Puts together image source info using data from cAPI.
  def buildImageData(imageData: Option[ImageMedia]): ImageInfo = {

    val fallbackImageUrl = imageData flatMap ImgSrc.getFallbackUrl
    val cardType = Standard

    val breakpointWidths = FaciaWidths.mediaFromItemClasses(ItemClasses(
      mobile = Standard,
      tablet = cardType,
      desktop = Some(cardType)
    )).breakpoints

    val sources = breakpointWidths.map { breakpointWidth =>
      ImageSource(
        breakpointWidth.breakpoint.minWidth.getOrElse("0").toString,
        breakpointWidth.width.toString,
        ImgSrc.srcsetForBreakpoint(breakpointWidth, breakpointWidths, None,
          imageData, hidpi = true),
        ImgSrc.srcsetForBreakpoint(breakpointWidth, breakpointWidths, None,
          imageData)
      )
    }

    ImageInfo(sources, fallbackImageUrl.getOrElse(""))

  }

  // Holds the source element data for the images.
  case class ImageSource (
    minWidth: String,
    sizes: String,
    hidpiSrcset: String,
    lodpiSrcset: String
  )

  object ImageSource {
    implicit val writesImageSource: Writes[ImageSource] =
      Json.writes[ImageSource]
  }

  // Holds all source element data, and the backup image src for older browsers.
  case class ImageInfo (sources: Seq[ImageSource], backupSrc: String)

  object ImageInfo {
    implicit val writesImageInfo: Writes[ImageInfo] = Json.writes[ImageInfo]
  }

}
