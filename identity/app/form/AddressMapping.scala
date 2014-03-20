package form

import play.api.i18n.Messages
import play.api.data.Forms._
import model.Countries

trait AddressMapping extends Mappings{

  private val AddressLinePattern = """[^\d\w\s'#,./-]""".r
  private val idAddressLine = textField verifying (
    Messages("error.address"),
    { value => value.isEmpty || AddressLinePattern.findFirstIn(value).isEmpty }
    )

  val idAddress = mapping(
    ("line1", idAddressLine),
    ("line2", idAddressLine),
    ("line3", idAddressLine),
    ("line4", idAddressLine),
    ("postcode", textField),
    ("country", idCountry)
  )(AddressFormData.apply)(AddressFormData.unapply) //verifying(
//    "error.postcode",
//    { address => address.isValidPostcodeOrZipcode
//    }
//  )
}

case class AddressFormData(
  address1: String,
  address2: String,
  address3: String,
  address4: String,
  postcode: String,
  country: String
){

//  protected val PostcodePattern = """^(GIR 0AA|[A-PR-UWYZ]([0-9]{1,2}|([A-HK-Y][0-9]|[A-HK-Y][0-9]([0-9]|[ABEHMNPRV-Y]))|[0-9][A-HJKPS-UW])[0-9][ABD-HJLNP-UW-Z]{2})$""".r
//
//  lazy val isValidPostcodeOrZipcode: Boolean = {
//    if(country == Countries.UK) isValidUkPostcode
//    else true
//  }
//
//  private lazy val isValidUkPostcode = postcode match {
//    case PostcodePattern(_) => true
//    case _ => false
//  }
}