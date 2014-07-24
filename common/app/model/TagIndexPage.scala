package model

import com.gu.openplatform.contentapi.model.{Tag => ApiTag}
import play.api.libs.json._

object TagDefinition {
  implicit val jsonFormat = Json.format[TagDefinition]

  def fromContentApiTag(apiTag: ApiTag): TagDefinition = TagDefinition(
    apiTag.webTitle,
    apiTag.id
  )
}

/** Minimal amount of information we need to serialize about tags */
case class TagDefinition(
  webTitle: String,
  id: String
)

object TagIndexPage {
  implicit val charFormat = new Format[Char] {
    override def reads(json: JsValue): JsResult[Char] = json match {
      case JsString(s) if s.length == 1 => JsSuccess(s.charAt(0))
      case JsString(s) => JsError(s"Expected one-character long string, got $s")
      case jValue => JsError(s"Expected string, got $jValue")
    }

    override def writes(o: Char): JsValue = JsString(o.toString)
  }

  implicit val jsonFormat = Json.format[TagIndexPage]
}

case class TagIndexPage(
  indexCharacter: Char,
  tags: Seq[TagDefinition]
)
