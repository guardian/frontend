package model

import com.gu.contentapi.client.model.v1.AssetType
import model.pressed.{Cutout, Replace, Image}

object ImageOverride {

  def createImageMedia(image: Image): Option[ImageMedia] = {

    val (maybeSrc, maybeWidth, maybeHeight) = image match {
      case cutout: Cutout   => (Some(cutout.imageSrc), cutout.imageSrcHeight, cutout.imageSrcWidth)
      case replace: Replace => (Some(replace.imageSrc), Some(replace.imageSrcHeight), Some(replace.imageSrcWidth))
      case _                => (None, None, None)
    }

    val assetFields: Option[Map[String, String]] = for {
      width <- maybeWidth
      height <- maybeHeight
    } yield {
      Map("width" -> width, "height" -> height)
    }

    val imageAsset = assetFields.map(fields => {
      ImageAsset(fields = fields, mediaType = AssetType.Image.name, mimeType = Some("image/jpg"), url = maybeSrc)
    })

    imageAsset.map { image =>
      ImageMedia.make(List(image))
    }
  }
}
