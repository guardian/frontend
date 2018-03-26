package form

import model.Countries
import play.api.data.Forms._
import play.api.data.Mapping
import play.api.i18n.{Messages, MessagesProvider}

trait AddressMapping extends Mappings {

  private val AddressLinePattern = """[^\w\s'#,./-]""".r
  private def idAddressLine(implicit messagesProvider: MessagesProvider): Mapping[String] = textField verifying (
    Messages("error.address"),
    { value => value.isEmpty || AddressLinePattern.findFirstIn(value).isEmpty }
  )

  def idAddress(implicit messagesProvider: MessagesProvider): Mapping[AddressFormData] = mapping(
    ("line1", idAddressLine),
    ("line2", idAddressLine),
    ("line3", idAddressLine),
    ("line4", idAddressLine),
    ("postcode", textField),
    ("country", idCountry)
  )(AddressFormData.apply)(AddressFormData.unapply) verifying
    ("error.postcode", address => address.isValidPostcodeOrZipcode)
}

case class AddressFormData(
  address1: String,
  address2: String,
  address3: String,
  address4: String,
  postcode: String,
  country: String
){
  import Countries.{UK, US}

  lazy val isValidPostcodeOrZipcode: Boolean = country match{
    case UK =>  isValidUkPostcode
    case US =>  isValidUsZipcode
    case _ => true
  }

  private val ZipcodePattern = """^\d{5}(?:[-\s]\d{4})?$""".r
  private lazy val isValidUsZipcode = {
      postcode.isEmpty || ZipcodePattern.findFirstIn(postcode).isDefined
  }

  private def stripSpacesAndUppercase(string: String) = string.toUpperCase.replaceAllLiterally(" ", "")

  private val PostcodePattern = """^(GIR 0AA)|((([A-Z-[QVX]][0-9][0-9]?)|(([A-Z-[QVX]][A-Z-[IJZ]][0-9][0-9]?)|(([A-Z-[QVX]][0-9][A-HJKSTUW])|([A-Z-[QVX]][A-Z-[IJZ]][0-9][ABEHMNPRVWXY]))))[0-9][A-Z-[CIKMOV]]{2})$""".r

  private lazy val isValidUkPostcode = {
      postcode.isEmpty || PostcodePattern.findFirstIn(stripSpacesAndUppercase(postcode)).isDefined
  }
}
