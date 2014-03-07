package form

import play.api.data.{Forms, Mapping}
import play.api.data.validation.Constraints
import play.api.data.Forms._
import play.api.data.format.Formats._
import play.api.i18n.Messages

trait Mappings {

  private val UrlPattern = """^(http|https)://([^/?#]*)?([^?#]*)(\?([^#]*))?(#(.*))?""".r
  val idUrl = text verifying (
    Messages("error.url"),
    { value => value.isEmpty || UrlPattern.findFirstIn(value).isDefined }
  )

  val idEmail: Mapping[String] = of[String] verifying Constraints.pattern(
    """\b[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@(?:[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+|localhost)\b""".r,
    "constraint.email",
    "error.email")

  val idPassword: Mapping[String] = of[String] verifying(
    Messages("error.passwordLength"), {value => 6 <= value.length && value.length <= 20}
  )

  val textField = text(maxLength = 255)
  val textArea = text(maxLength = 1500)

  def comboList(values: Seq[String]) = text verifying { values contains _}

}
