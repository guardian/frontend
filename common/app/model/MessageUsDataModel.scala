package model

import play.api.libs.json.{Format, Json}

case class MessageUsConfigData(articleId: String, formId: String)
case class MessageUsData(formId: String)

object MessageUsConfigData {
  implicit val MessageUsConfigDataJf: Format[MessageUsConfigData] = Json.format[MessageUsConfigData]
}

object MessageUsData {
  implicit val MessageUsDataJf: Format[MessageUsData] = Json.format[MessageUsData]
}
