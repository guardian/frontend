package form

import play.api.data.Mapping
import play.api.data.validation.Constraints
import play.api.data.Forms._
import play.api.data.format.Formats._
import play.api.i18n.Messages


object Mappings {
  val idEmail: Mapping[String] = of[String] verifying Constraints.pattern(
    """\b[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@(?:[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+|localhost)\b""".r,
    "constraint.email",
    "error.email")

  val idPassword: Mapping[String] = of[String] verifying(
    Messages("error.passwordLength"), {value => 6 <= value.length && value.length <= 20}
  )
}
