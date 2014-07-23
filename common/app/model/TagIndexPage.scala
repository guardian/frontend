package model

import com.gu.openplatform.contentapi.model.{Tag => ApiTag}
import play.api.libs.json.Json

object TagIndexPage {
  implicit val jsonFormat = Json.format[TagIndexPage]
}

case class TagIndexPage(
  indexCharacter: Char,
  tags: Seq[ApiTag]
)
