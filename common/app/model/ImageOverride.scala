package model

import com.gu.openplatform.contentapi.model.{Asset, Element => ApiElement}
import org.joda.time.DateTime

object ImageOverride {

  def createElementWithOneAsset(imageSrc: String, width: String, height: String): ApiElement = ApiElement(
    id = DateTime.now.getMillis.toString,
    relation = "thumbnail",
    `type` = "image",
    galleryIndex = None,
    assets = List(Asset(
      `type` = "image",
      mimeType = Option("image/jpg"),
      file = Option(imageSrc),
      typeData = Map("width" -> width, "height" -> height)
    ))
  )
}