package form

import play.api.data.Mapping
import play.api.data.Forms._
import play.api.data.format.Formats._
import play.api.i18n.{Messages, I18nSupport}
import model.Countries
import org.scala_tools.time.Imports._
import jobs.BlockedEmailDomainList
import conf.switches.Switches

trait Mappings extends I18nSupport {

  val textField = text(maxLength = 255)
  val textArea = text(maxLength = 1500)

  def comboList(values: Seq[String]) = text verifying { values contains _}

  private val UrlPattern = """^(http|https)://([^/?#]*)?([^?#]*)(\?([^#]*))?(#(.*))?""".r
  val idUrl = text verifying (
    Messages("error.url"),
    { value => value.isEmpty || UrlPattern.findFirstIn(value).isDefined }
  )

  private val EmailPattern = """(.*)@(.*)""".r

  val idRegEmail = text.verifying (
    Messages("error.emailDomainInvalid"),
    { value =>
      //Let the identity API validate emails - don't try to extadct the domain from a badll formed email
      if( Switches.IdentityBlockSpamEmails.isSwitchedOn && value.matches(EmailPattern.toString))
      {
        val EmailPattern(name, domain) = value
        !(BlockedEmailDomainList.getBlockedDomains.contains(domain))
      } else { true }
    }
  )

  val idEmail: Mapping[String] = text.verifying(Messages("error.email"), value => value.isEmpty || EmailPattern.findFirstIn(value).isDefined)

  val idFirstName: Mapping[String] = nonEmptyText(maxLength = 50)

  val idSecondName: Mapping[String] = nonEmptyText(maxLength = 50)

  val idPassword: Mapping[String] = text verifying(
    Messages("error.passwordLength"), {value => 6 <= value.length && value.length <= 20}
  )

  val idCountry = comboList("" :: Countries.all)

}
