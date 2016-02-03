package models

import java.net.URI

import play.api.libs.json._

import scala.util.{Failure, Success, Try}

object URIFormats {

  // URI serializer/deserializer
  implicit val uf = new Format[URI] {
    override def writes(uri: URI): JsValue = JsString(uri.toString)
    override def reads(json: JsValue): JsResult[URI] = {
      val error = JsError("Value is expected to convert to URI")
      json match {
        case JsString(s) =>
          Try(URI.create(s)) match {
            case Success(uri) => JsSuccess(uri)
            case Failure(_) => error
          }
        case _ => error
      }
    }
  }

}
