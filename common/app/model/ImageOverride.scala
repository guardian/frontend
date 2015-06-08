package model

import com.gu.contentapi.client.model.{Asset, Element => ApiElement}
import org.joda.time.DateTime

object ImageOverride {

  def createElementWithOneAsset(imageSrc: String, width: Option[String], height: Option[String]): ApiElement = {
    val widthAndHeightMap = (for {
      w <- width
      h <- height
    } yield Map("width" -> w, "height" -> h))
      .getOrElse(Map.empty)

    ApiElement(
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
  }

  def createElementWithOneAsset(imageSrc: String, width: String, height: String): ApiElement =
    createElementWithOneAsset(imageSrc, Option(width), Option(height))

}
