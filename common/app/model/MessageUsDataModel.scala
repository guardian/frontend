package model

import model.FieldType.FieldType
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json._

import scala.language.implicitConversions

sealed trait Field {
  def id: String
  def label: String
  def name: String
  def required: Boolean
  def `type`: FieldType
}

case class EmailField(
    id: String,
    label: String = "email",
    name: String,
    required: Boolean,
    `type`: FieldType = FieldType.Email,
) extends Field

case class NameField(
    id: String,
    label: String = "name",
    name: String,
    required: Boolean,
    `type`: FieldType = FieldType.Name,
) extends Field

case class TextAreaField(
    id: String,
    label: String = "textarea",
    name: String,
    required: Boolean,
    `type`: FieldType = FieldType.TextArea,
    minlength: Int = 0,
    maxlength: Int = 1000,
) extends Field

object FieldType extends Enumeration {
  type FieldType = Value

  val Name = Value(1, "text")
  val Email = Value(2, "email")
  val TextArea = Value(3, "textarea")

  implicit val format: Format[FieldType] = Json.formatEnum(this)

}

sealed trait FieldFormats {
  private val commonFieldReads = (JsPath \ "id").read[String] and
    (JsPath \ "label").read[String] and
    (JsPath \ "name").read[String] and
    (JsPath \ "required").read[Boolean]

  implicit val nameFieldRead: Reads[NameField] = (commonFieldReads and
    Reads.pure(FieldType.Name))(NameField.apply _)

  implicit val emailFieldRead: Reads[EmailField] = (commonFieldReads and
    Reads.pure(FieldType.Email))(EmailField.apply _)

  implicit val textAreaFieldRead: Reads[TextAreaField] = (commonFieldReads and
    Reads.pure(FieldType.TextArea) and
    (JsPath \ "minlength").read[Int] and
    (JsPath \ "maxlength").read[Int])(TextAreaField.apply _)

  implicit val fieldReadFmt: Reads[Field] = Reads { js =>
    val fieldType: JsResult[FieldType] = (JsPath \ "type").read[FieldType].reads(js)

    fieldType.flatMap {
      case FieldType.Name     => nameFieldRead.reads(js)
      case FieldType.Email    => emailFieldRead.reads(js)
      case FieldType.TextArea => textAreaFieldRead.reads(js)
    }
  }

  implicit val nameFieldWrite = Json.writes[NameField]
  implicit val emailFieldWrite = Json.writes[EmailField]
  implicit val textAreaFieldWrite = Json.writes[TextAreaField]

  implicit val fieldWriteFmt: Writes[Field] = Json.writes[Field]
}

case class MessageUsData(formId: String, formFields: List[Field])
object MessageUsData extends FieldFormats {
  implicit val MessageUsDataJf: Format[MessageUsData] = Json.format[MessageUsData]
}

case class MessageUsConfigData(articleId: String, formId: String, formFields: List[Field])
object MessageUsConfigData extends FieldFormats {
  implicit val MessageUsConfigDataJf: Format[MessageUsConfigData] = Json.format[MessageUsConfigData]
}
