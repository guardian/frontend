package form

import com.google.i18n.phonenumbers.PhoneNumberUtil
import com.gu.identity.model.TelephoneNumber
import scala.util._
import play.api.data.Forms._
import scala.util.Success
import scala.util.Failure
import play.api.i18n.{Messages, I18nSupport}

trait TelephoneNumberMapping extends I18nSupport {

  val telephoneNumberMapping = mapping(
    "countryCode" -> optional(text),
    "localNumber" -> optional(text)
  )(TelephoneNumberFormData.apply)(TelephoneNumberFormData.unapply) verifying (
    Messages("error.telephoneNumber"),
    {
      data => data.isValid }
    )

}

case class TelephoneNumberFormData(countryCode: Option[String], localNumber: Option[String]){

  lazy val telephoneNumber: Option[TelephoneNumber] = (countryCode, localNumber) match {
    case (Some(cc), Some(ln)) => Some(TelephoneNumber(Some(cc), Some(ln)))
    case _ => None

  }
  lazy val isValid: Boolean = {
    (countryCode, localNumber) match {
      case (Some(cc), Some(ln)) =>
        val internationalNumber = s"+$cc$ln"
        val phoneUtil = PhoneNumberUtil.getInstance()
        Try {
          val parsed = phoneUtil.parse(internationalNumber, "")
          phoneUtil.isValidNumber(parsed)
        } match {
          case Success(result) => result
          case Failure(t) => false
        }
      case (Some(cc), None) => false
      case (None, Some(ln)) => false
      case _ => true
    }

  }
}

object TelephoneNumberFormData {
  def apply(telephoneNumber: TelephoneNumber): TelephoneNumberFormData = TelephoneNumberFormData(
    telephoneNumber.countryCode, telephoneNumber.localNumber
  )
}
