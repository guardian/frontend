package form

import play.api.data.Forms._
import scala.Some
import play.api.i18n.Messages
import com.gu.identity.model.{PrivateFields, User}
import idapiclient.UserUpdate

object AccountDetailsMapping extends UserFormMapping[AccountFormData] {

  private val genders = List("Male", "Female", "unknown", "")

  protected lazy val formMapping = {
    val baseMapping = mapping(
      "primaryEmailAddress" -> idEmail,
      "password" -> idPassword,
      "confirmPassword" -> idPassword,
      "firstName" -> textField,
      "secondName" -> textField,
      "gender" -> comboList(genders)
    )(AccountFormData.apply)(AccountFormData.unapply)
    baseMapping verifying (Messages("error.passwordsMustMatch"), { _.validatePassword })
  }

  protected def fromUser(user: User) = AccountFormData(user)

  protected lazy val contextMap = Map(
    "password" -> "password",
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
  password: String,
  confirmPassword: String,
  firstName: String,
  secondName: String,
  gender: String
) extends UserFormData{
  lazy val validatePassword: Boolean = password == confirmPassword

  lazy val toUserUpdate: UserUpdate = UserUpdate(
    primaryEmailAddress = Some(primaryEmailAddress),
    password = Some(password),
    privateFields = Some(PrivateFields(firstName = Some(firstName), secondName = Some(secondName), gender = Some(gender)))
  )

}

object AccountFormData {

  def apply(user: User): AccountFormData = AccountFormData(
    primaryEmailAddress = user.primaryEmailAddress,
    password = user.password getOrElse "",
    confirmPassword = user.password getOrElse "",
    firstName = user.privateFields.firstName getOrElse "",
    secondName = user.privateFields.secondName getOrElse "",
    gender = user.privateFields.gender getOrElse "unknown"
  )
}
