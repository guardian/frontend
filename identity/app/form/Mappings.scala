package form

import play.api.data.Mapping
import play.api.data.Forms._
import play.api.i18n.{Messages, MessagesProvider}
import model.Countries

import scala.util.matching.Regex

trait Mappings {

  val textField: Mapping[String] = text(maxLength = 255)
  val textArea: Mapping[String] = text(maxLength = 1500)

  def comboList(values: Seq[String]): Mapping[String] = text verifying { values contains _ }

  private val EmailPattern: Regex = """(.*)@(.*)""".r

  def idEmail(implicit messagesProvider: MessagesProvider): Mapping[String] =
    text.verifying(
      Messages("error.email"),
      value => value.isEmpty || EmailPattern.findFirstIn(value).isDefined,
    )

  def idPassword(implicit messagesProvider: MessagesProvider): Mapping[String] =
    text verifying (
      Messages("error.passwordLength"), { value => 6 <= value.length && value.length <= 72 }
    )

  val idCountry: Mapping[String] = comboList("" :: Countries.all)

}
