package form

import play.api.data.Forms._
import com.gu.identity.model.{PrivateFields, User}
import idapiclient.UserUpdate

object AccountDetailsMapping extends UserFormMapping[AccountFormData] {

  private val genders = List("Male", "Female", "Transgender", "unknown", "")

  protected lazy val formMapping = {
    mapping(
      "primaryEmailAddress" -> idEmail,
      "firstName" -> textField,
      "secondName" -> textField,
      "gender" -> comboList(genders)
    )(AccountFormData.apply)(AccountFormData.unapply)
  }

  protected def fromUser(user: User) = AccountFormData(user)

  protected lazy val contextMap = Map(
    "privateFields.firstName" -> "firstName",
    "privateFields.secondName" -> "secondName",
    "privateFields.gender" -> "gender"
  )
}

trait AccountDetailsMapping {
  val accountDetailsMapping = AccountDetailsMapping
}

case class AccountFormData(
  primaryEmailAddress: String,
  firstName: String,
  secondName: String,
  gender: String
) extends UserFormData{

  def toUserUpdate(currentUser: User): UserUpdate = UserUpdate(
    primaryEmailAddress = toUpdate(primaryEmailAddress, Some(currentUser.primaryEmailAddress)),
    privateFields = Some(PrivateFields(
      firstName = toUpdate(firstName, currentUser.privateFields.firstName),
      secondName = toUpdate(secondName, currentUser.privateFields.secondName),
      gender = toUpdate(gender, currentUser.privateFields.gender)
    ))
  )

}

object AccountFormData {

  def apply(user: User): AccountFormData = AccountFormData(
    primaryEmailAddress = user.primaryEmailAddress,
    firstName = user.privateFields.firstName getOrElse "",
    secondName = user.privateFields.secondName getOrElse "",
    gender = user.privateFields.gender getOrElse "unknown"
  )
}
