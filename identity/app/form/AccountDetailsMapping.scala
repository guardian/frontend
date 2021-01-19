package form

import model.Titles
import play.api.data.Forms._
import com.gu.identity.model.{Consent, PrivateFields, User, UserDates}
import idapiclient.UserUpdateDTO
import play.api.data.Mapping
import play.api.i18n.MessagesProvider

class AccountDetailsMapping
    extends UserFormMapping[AccountFormData]
    with AddressMapping
    with DateMapping
    with TelephoneNumberMapping {

  def formMapping(implicit messagesProvider: MessagesProvider): Mapping[AccountFormData] =
    mapping(
      "primaryEmailAddress" -> idEmail,
      "title" -> comboList("" :: Titles.titles),
      "firstName" -> nonEmptyText,
      "secondName" -> nonEmptyText,
      "address" -> idAddress,
      "billingAddress" -> optional(idAddress),
      "telephoneNumber" -> optional(telephoneNumberMapping),
      "deleteTelephoneNumber" -> default(boolean, false),
    )(AccountFormData.apply)(AccountFormData.unapply _)

  protected def toUserFormData(user: User) = AccountFormData(user)

}

case class AccountFormData(
    primaryEmailAddress: String,
    title: String,
    firstName: String,
    secondName: String,
    address: AddressFormData,
    billingAddress: Option[AddressFormData],
    telephoneNumber: Option[TelephoneNumberFormData],
    deleteTelephone: Boolean = false,
) extends UserFormData

object AccountFormData {

  def apply(user: User): AccountFormData =
    AccountFormData(
      primaryEmailAddress = user.primaryEmailAddress,
      title = user.privateFields.title getOrElse "",
      firstName = user.privateFields.firstName getOrElse "",
      secondName = user.privateFields.secondName getOrElse "",
      address = AddressFormData(
        address1 = user.privateFields.address1 getOrElse "",
        address2 = user.privateFields.address2 getOrElse "",
        address3 = user.privateFields.address3 getOrElse "",
        address4 = user.privateFields.address4 getOrElse "",
        postcode = user.privateFields.postcode getOrElse "",
        country = user.privateFields.country getOrElse "",
      ),
      billingAddress = {
        import user.privateFields._
        if (
          List(
            billingAddress1,
            billingAddress2,
            billingAddress3,
            billingAddress4,
            billingPostcode,
            billingCountry,
          ).flatten.isEmpty
        )
          None
        else
          Some(
            AddressFormData(
              billingAddress1.getOrElse(""),
              billingAddress2.getOrElse(""),
              billingAddress3.getOrElse(""),
              billingAddress4.getOrElse(""),
              billingPostcode.getOrElse(""),
              billingCountry.getOrElse(""),
            ),
          )
      },
      telephoneNumber = user.privateFields.telephoneNumber.map(TelephoneNumberFormData(_)),
    )
}
