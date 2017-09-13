package form

import model.Titles
import play.api.data.Forms._
import com.gu.identity.model.{PrivateFields, User, UserDates}
import idapiclient.UserUpdate
import play.api.i18n.MessagesProvider

class AccountDetailsMapping extends UserFormMapping[AccountFormData] with AddressMapping with DateMapping with TelephoneNumberMapping {

  private val genders = List("Male", "Female", "Transgender", "Other", "unknown", "")

  protected def formMapping(implicit messagesProvider: MessagesProvider) = {
    mapping(
      ("primaryEmailAddress", idEmail),
      ("title", comboList("" :: Titles.titles)),
      ("firstName",  nonEmptyText),
      ("secondName", nonEmptyText),
      ("gender", comboList(genders)),
      "birthDate" -> dateMapping,
      "address" -> idAddress,
      "billingAddress" -> optional(idAddress),
      "telephoneNumber" -> optional(telephoneNumberMapping),
      "deleteTelephoneNumber" -> default(boolean, false)
    )(AccountFormData.apply)(AccountFormData.unapply _)
  }

  protected def fromUser(user: User) = AccountFormData(user)

  protected lazy val contextMap = Map(
    ("privateFields.title", "title"),
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
    ("privateFields.billingCountry", "billingAddress.country"),
    ("privateFields.telephoneNumber", "telephoneNumber")
  )
}

case class AccountFormData(
  primaryEmailAddress: String,
  title: String,
  firstName: String,
  secondName: String,
  gender: String,
  birthDate: DateFormData,
  address: AddressFormData,
  billingAddress: Option[AddressFormData],
  telephoneNumber: Option[TelephoneNumberFormData],
  deleteTelephone: Boolean = false
) extends UserFormData {

  def toUserUpdate(currentUser: User): UserUpdate = UserUpdate(
    primaryEmailAddress = toUpdate(primaryEmailAddress, Some(currentUser.primaryEmailAddress)),
    dates = Some(UserDates(birthDate = birthDate.dateTime)),
    privateFields = Some(PrivateFields(
      title = toUpdate(title, currentUser.privateFields.title),
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
      billingCountry = billingAddress.flatMap(x => toUpdate(x.country, currentUser.privateFields.billingCountry)),
      telephoneNumber = telephoneNumber.flatMap(_.telephoneNumber)
    ))
  )
}

object AccountFormData {

  def apply(user: User): AccountFormData = AccountFormData(
    primaryEmailAddress = user.primaryEmailAddress,
    title = user.privateFields.title getOrElse "",
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
    },
    telephoneNumber = user.privateFields.telephoneNumber.map(TelephoneNumberFormData(_))
  )
}
