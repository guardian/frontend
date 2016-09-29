package model.commercial

import views.support.ImgSrc
import cards.{Standard, Half, Third}
import layout.{FaciaWidths, ItemClasses}
import model.ImageMedia
import play.api.libs.json.{Json, Writes}

object CapiImages {

  // Puts together image source info using data from cAPI.
  def buildImageData(imageData: Option[ImageMedia], noImages: Int = 1) = {

    val fallbackImageUrl = imageData flatMap ImgSrc.getFallbackUrl
    val imageType = noImages match {
      case 3 => Third
      case 2 => Half
      case _ => Standard
    }

    val breakpointWidths = FaciaWidths.mediaFromItemClasses(ItemClasses(
      mobile = Standard,
      tablet = imageType,
      desktop = Some(imageType)
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

    ImageInfo(sources, fallbackImageUrl)

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
  case class ImageInfo (sources: Seq[ImageSource], backupSrc: Option[String])

  object ImageInfo {
    implicit val writesImageInfo: Writes[ImageInfo] = Json.writes[ImageInfo]
  }

}
