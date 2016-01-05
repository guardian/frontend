package model

import com.gu.contentapi.client.model.v1.{Asset, Element => ApiElement, AssetFields, AssetType, ElementType}

import scala.util.Try

object ImageOverride {

  def createElementWithOneAsset(imageSrc: String, width: Option[String], height: Option[String]): Element = {
    val widthAndHeightMap = for {
      wString <- width
      wInt <- Try(wString.toInt).toOption
      hString <- height
      hInt <- Try(hString.toInt).toOption
    } yield AssetFields(width = Some(wInt), height = Some(hInt))

    val contentApiElement = ApiElement(
      id = "override",
      relation = "thumbnail",
      // Image
      `type` = ElementType(0),
      galleryIndex = None,
      assets = List(Asset(
        // Image
        `type` = AssetType(0),
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
