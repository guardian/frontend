package form

import play.api.data.Mapping
import play.api.data.Forms._
import play.api.data.format.Formats._
import play.api.i18n.Messages
import model.Countries
import org.scala_tools.time.Imports._

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

  val idPassword: Mapping[String] = of[String] verifying(
    Messages("error.passwordLength"), {value => 6 <= value.length && value.length <= 20}
  )

  val idCountry = comboList("" :: Countries.all)

}
