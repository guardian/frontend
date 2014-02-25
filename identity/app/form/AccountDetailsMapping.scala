package form

import play.api.data.Forms._
import scala.Some
import play.api.i18n.Messages
import com.gu.identity.model.User

object AccountDetailsMapping extends UserFormMapping[AccountFormData] {

  protected lazy val formMapping = {
    val baseMapping = mapping(
      "primaryEmailAddress" -> idEmail,
      "password1" -> idPassword,
      "password2" -> idPassword,
      "privateFields.firstName" -> optionalTextField,
      "privateFields.secondName" -> optionalTextField
    )(AccountFormData.apply)(AccountFormData.unapply)
    baseMapping verifying (Messages("error.passwordsMustMatch"), { _.validatePassword })
  }

  protected def fromUser(user: User) = AccountFormData(user)

  protected lazy val contextMap = Map(
    "primaryEmailAddress" -> "primaryEmailAddress",
    "password" -> "password",
    "publicFields.firstName" -> "secondName",
    "publicFields.secondName" -> "secondName"
  )
}

trait AccountDetailsMapping {
  val accountDetailsMapping = AccountDetailsMapping
}

case class AccountFormData(
                            primaryEmailAddress: String,
                            password: String,
                            confirmPassword: String,
                            firstName: Option[String],
                            secondName: Option[String]
                            ){
  lazy val validatePassword: Boolean = password == confirmPassword

  def updateUser(user: User): User = {
    user.copy(primaryEmailAddress = primaryEmailAddress,
      password = Some(password),
      privateFields = user.privateFields.copy(firstName = firstName, secondName = secondName)
    )
  }

  lazy val toUser: User = updateUser(User())
}

object AccountFormData {

  def apply(user: User): AccountFormData = AccountFormData(
    primaryEmailAddress = user.primaryEmailAddress,
    password = user.password getOrElse "",
    confirmPassword = user.password getOrElse "",
    firstName = user.privateFields.firstName,
    secondName = user.privateFields.secondName
  )
}
