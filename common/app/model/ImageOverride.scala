package model

import com.gu.openplatform.contentapi.model.{Asset, Element => ApiElement}
import org.joda.time.DateTime

object ImageOverride {

  def createElementWithOneAsset(imageSrc: String): ApiElement = ApiElement(
    id = DateTime.now.getMillis.toString,
    relation = "thumbnail",
    `type` = "image",
    galleryIndex = None,
    assets = List(makeAsset(imageSrc))
  )

  private def makeAsset(imageSrc: String): Asset = Asset(
    `type` = "image",
    mimeType = Option("image/jpg"),
    file = Option(imageSrc),
    typeData = Map("width" -> "620", "height" -> "372")
  )

}