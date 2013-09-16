package model

import org.joda.time.DateTime
import play.api.libs.json._
import play.api.libs.json.Json.toJson
import views.support.JavaScriptVariableName

trait Formats {
  implicit val imageFormat: Writes[ImageAsset] = new Writes[ImageAsset] {
    def writes(image: ImageAsset): JsValue = toJson(
      Map(
        ("index", toJson(image.index)),
        ("url", toJson(image.url)),
        ("thumbnail", toJson(image.thumbnail)),
        ("width", toJson(image.width)),
        ("caption", toJson(image.caption)),
        ("altText", toJson(image.altText)),
        ("source", toJson(image.source)),
        ("photographer", toJson(image.photographer)),
        ("credit", toJson(image.credit))
      )
    )
  }

  implicit val galleryFormat: Writes[Gallery] = new Writes[Gallery] {
    def writes(gallery: Gallery): JsValue = toJson(
      Map(
        "pictures" -> gallery.crops.map(toJson(_))
      )
    )
  }

  // Some advice at: http://markembling.info/2011/07/json-date-time
  implicit val dateTimeFormat: Writes[DateTime] = new Writes[DateTime] {
    def writes(datetime: DateTime) = toJson(datetime.toISODateTimeString)
  }

  implicit val metaDataFormat: Writes[MetaData] = new Writes[MetaData] {
    def writes(item: MetaData): JsValue = toJson(
      item.metaData map {
        case (key, value) => JavaScriptVariableName(key) -> value
      } mapValues {
        case date: DateTime => toJson(date)
        case string: String => toJson(string)
        case boolean: Boolean => toJson(boolean)
      }
    )
  }
}
