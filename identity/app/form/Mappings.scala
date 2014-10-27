package form

import model.Countries
import play.api.data.Forms._
import play.api.data.Mapping
import play.api.data.format.Formats._
import play.api.i18n.Messages

trait Mappings {

  val textField = text(maxLength = 255)
  val textArea = text(maxLength = 1500)

  def comboList(values: Seq[String]) = text verifying { values contains _}

  private val UrlPattern = """^(http|https)://([^/?#]*)?([^?#]*)(\?([^#]*))?(#(.*))?""".r
  val idUrl = text verifying (
    Messages("error.url"),
    { value => value.isEmpty || UrlPattern.findFirstIn(value).isDefined }
  )

  val idEmail: Mapping[String] = email

  val idFirstName: Mapping[String] = nonEmptyText(maxLength = 50)

  val idSecondName: Mapping[String] = nonEmptyText(maxLength = 50)

  val idPassword: Mapping[String] = of[String] verifying(
    Messages("error.passwordLength"), {value => 6 <= value.length && value.length <= 20}
  )

  val idCountry = comboList("" :: Countries.all)

}
