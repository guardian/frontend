package model

import com.gu.contentapi.client.model.{Asset, Element => ApiElement}

object ImageOverride {

  def createElementWithOneAsset(imageSrc: String, width: Option[String], height: Option[String]): Element = {
    val widthAndHeightMap = (for {
      w <- width
      h <- height
    } yield Map("width" -> w, "height" -> h))
      .getOrElse(Map.empty)

    val contentApiElement = ApiElement(
      id = "override",
      relation = "thumbnail",
      `type` = "image",
      galleryIndex = None,
      assets = List(Asset(
        `type` = "image",
        mimeType = Option("image/jpg"),
        file = Option(imageSrc),
        typeData = widthAndHeightMap
      ))
    )
    Element(contentApiElement, 0)
  }

  def createElementWithOneAsset(imageSrc: String, width: String, height: String): Element =
    createElementWithOneAsset(imageSrc, Option(width), Option(height))

}
