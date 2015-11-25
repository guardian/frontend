package form

import play.api.data.Forms._
import com.gu.identity.model.{UserDates, PrivateFields, User}
import idapiclient.UserUpdate
import play.api.i18n.Messages.Implicits.applicationMessagesApi
import play.api.Play.current

object AccountDetailsMapping extends UserFormMapping[AccountFormData] with AddressMapping with DateMapping {
  override val messagesApi = applicationMessagesApi

  private val genders = List("Male", "Female", "Transgender", "unknown", "")

  protected lazy val formMapping = {
    mapping(
      ("primaryEmailAddress", idEmail),
      ("firstName", textField),
      ("secondName", textField),
      ("gender", comboList(genders)),
      "birthDate" -> dateMapping,
      "address" -> idAddress,
      "billingAddress" -> optional(idAddress)
    )(AccountFormData.apply)(AccountFormData.unapply)
  }

  protected def fromUser(user: User) = AccountFormData(user)

  protected lazy val contextMap = Map(
    ("privateFields.firstName", "firstName"),
    ("privateFields.secondName", "secondName"),
    ("privateFields.gender", "gender"),
    ("dates.birthDate", "birthDate"),
    ("privateFields.address1", "address.line1"),
    ("privateFields.address2", "address.line2"),
    ("privateFields.address3", "address.line3"),
    ("privateFields.address4", "address.line4"),
    ("privateFields.postcode", "address.postcode"),
    ("privateFields.country", "address.country"),
    ("privateFields.billingAddress1", "billingAddress.line1"),
    ("privateFields.billingAddress2", "billingAddress.line2"),
    ("privateFields.billingAddress3", "billingAddress.line3"),
    ("privateFields.billingAddress4", "billingAddress.line4"),
    ("privateFields.billingPostcode", "billingAddress.postcode"),
    ("privateFields.billingCountry", "billingAddress.country")
  )
}

trait AccountDetailsMapping {
  val accountDetailsMapping = AccountDetailsMapping
}

case class AccountFormData(
  primaryEmailAddress: String,
  firstName: String,
  secondName: String,
  gender: String,
  birthDate: DateFormData,
  address: AddressFormData,
  billingAddress: Option[AddressFormData]
) extends UserFormData {

  def toUserUpdate(currentUser: User): UserUpdate = UserUpdate(
    primaryEmailAddress = toUpdate(primaryEmailAddress, Some(currentUser.primaryEmailAddress)),
    dates = Some(UserDates(birthDate = birthDate.dateTime)),
    privateFields = Some(PrivateFields(
      firstName = toUpdate(firstName, currentUser.privateFields.firstName),
      secondName = toUpdate(secondName, currentUser.privateFields.secondName),
      gender = toUpdate(gender, currentUser.privateFields.gender),
      address1 = toUpdate(address.address1, currentUser.privateFields.address1),
      address2 = toUpdate(address.address2, currentUser.privateFields.address2),
      address3 = toUpdate(address.address3, currentUser.privateFields.address3),
      address4 = toUpdate(address.address4, currentUser.privateFields.address4),
      postcode = toUpdate(address.postcode, currentUser.privateFields.postcode),
      country = toUpdate(address.country, currentUser.privateFields.country),
      billingAddress1 = billingAddress.flatMap(x => toUpdate(x.address1, currentUser.privateFields.billingAddress1)),
      billingAddress2 = billingAddress.flatMap(x => toUpdate(x.address2, currentUser.privateFields.billingAddress2)),
      billingAddress3 = billingAddress.flatMap(x => toUpdate(x.address3, currentUser.privateFields.billingAddress3)),
      billingAddress4 = billingAddress.flatMap(x => toUpdate(x.address4, currentUser.privateFields.billingAddress4)),
      billingPostcode = billingAddress.flatMap(x => toUpdate(x.postcode, currentUser.privateFields.billingPostcode)),
      billingCountry = billingAddress.flatMap(x => toUpdate(x.country, currentUser.privateFields.billingCountry))
    ))
  )
}

object AccountFormData {

  def apply(user: User): AccountFormData = AccountFormData(
    primaryEmailAddress = user.primaryEmailAddress,
    firstName = user.privateFields.firstName getOrElse "",
    secondName = user.privateFields.secondName getOrElse "",
    gender = user.privateFields.gender getOrElse "unknown",
    birthDate = DateFormData(user.dates.birthDate),
    address = AddressFormData(
      address1 = user.privateFields.address1 getOrElse "",
      address2 = user.privateFields.address2 getOrElse "",
      address3 = user.privateFields.address3 getOrElse "",
      address4 = user.privateFields.address4 getOrElse "",
      postcode = user.privateFields.postcode getOrElse "",
      country = user.privateFields.country getOrElse ""
    ),
    billingAddress = {
      import user.privateFields._
      if (List(billingAddress1, billingAddress2, billingAddress3, billingAddress4, billingPostcode, billingCountry).flatten.isEmpty)
        None
      else
        Some(AddressFormData(
          billingAddress1.getOrElse(""),
          billingAddress2.getOrElse(""),
          billingAddress3.getOrElse(""),
          billingAddress4.getOrElse(""),
          billingPostcode.getOrElse(""),
          billingCountry.getOrElse("")))
    }
  )
}
