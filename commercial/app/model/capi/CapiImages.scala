package commercial.model.capi

import views.support.{ImgSrc, SrcSet}
import layout.cards.{Half, Standard, Third}
import com.gu.contentapi.client.model.v1.{Asset, AssetType}
import layout.{FaciaWidths, ItemClasses}
import model.{ImageAsset, ImageMedia}
import play.api.libs.json.{Json, Writes}

object CapiImages {

  def buildImageDataFromUrl(imageUrl: String, noImages: Int = 1): ImageInfo = {
    val asset: Asset = Asset(AssetType.Image, Some("image/jpeg"), Some(imageUrl))
    val imageAsset: ImageAsset = ImageAsset.make(asset, 0)
    val image: ImageMedia = ImageMedia(List(imageAsset))
    buildImageData(Some(image))
  }

  // Puts together image source info using data from cAPI.
  def buildImageData(imageData: Option[ImageMedia], noImages: Int = 1): ImageInfo = {

    val altText = imageData flatMap (_.masterImage.flatMap(_.altText))
    val fallbackImageUrl = imageData flatMap ImgSrc.getFallbackUrl
    val imageType = noImages match {
      case 3 => Third
      case 2 => Half
      case _ => Standard
    }

    val breakpointWidths = FaciaWidths
      .mediaFromItemClasses(
        ItemClasses(
          mobile = Standard,
          tablet = imageType,
          desktop = Some(imageType),
        ),
      )
      .breakpoints

    val sources = breakpointWidths.map { breakpointWidth =>
      ImageSource(
        breakpointWidth.breakpoint.minWidth.getOrElse("0").toString,
        breakpointWidth.width.toString,
        SrcSet.asSrcSetString(
          ImgSrc.srcsetForBreakpoint(breakpointWidth, breakpointWidths, None, imageData, hidpi = true),
        ),
        SrcSet.asSrcSetString(ImgSrc.srcsetForBreakpoint(breakpointWidth, breakpointWidths, None, imageData)),
      )
    }

    ImageInfo(sources, fallbackImageUrl, altText)

  }
}

// Holds the source element data for the images.
case class ImageSource(
    minWidth: String,
    sizes: String,
    hidpiSrcset: String,
    lodpiSrcset: String,
)

object ImageSource {
  implicit val writesImageSource: Writes[ImageSource] = Json.writes[ImageSource]
}

// Holds all source element data, the backup image src for older browsers, and the alt text.
case class ImageInfo(sources: Seq[ImageSource], backupSrc: Option[String], altText: Option[String])

object ImageInfo {
  implicit val writesImageInfo: Writes[ImageInfo] = Json.writes[ImageInfo]
}
