package util

import com.gu.contentapi.client.model._
import play.api.libs.json.{JsResult, JsValue, Reads, Json}

case class RealTag(
    id: String,
    `type` : String,
    sectionId: Option[String],
    sectionName: Option[String],
    webTitle: String,
    webUrl: String,
    apiUrl: String,
    references: Option[List[Reference]],
    description: Option[String],
    bio: Option[String],
    bylineImageUrl: Option[String],
    bylineLargeImageUrl: Option[String],
    podcast: Option[Podcast]
) {
  def toTag = Tag(
    id,
    `type`,
    sectionId,
    sectionName,
    webTitle,
    webUrl,
    apiUrl,
    references getOrElse Nil,
    description,
    bio,
    bylineImageUrl,
    bylineLargeImageUrl,
    podcast
  )
}

object ApiContentReads {
  implicit val assetReads = Json.reads[Asset]
  implicit val podcastReads = Json.reads[Podcast]
  implicit val mediaEncodingReads = Json.reads[MediaEncoding]
  implicit val referenceReads = Json.reads[Reference]
  implicit val elementReads = Json.reads[Element]
  implicit val tagReads = Json.reads[RealTag].map(_.toTag)
  implicit val contentReads = Json.reads[Content]
}
