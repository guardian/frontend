package form

import play.api.data.Forms._
import com.gu.identity.model.{PublicFields, User}
import idapiclient.UserUpdateDTO
import play.api.data.Mapping
import play.api.i18n.{MessagesApi, MessagesProvider}

class ProfileMapping extends UserFormMapping[ProfileFormData] {

  def formMapping(implicit messagesProvider: MessagesProvider): Mapping[ProfileFormData] =
    mapping(
      "location" -> textField,
      "aboutMe" -> textArea,
      "interests" -> textField,
      "username" -> textField,
    )(ProfileFormData.apply)(ProfileFormData.unapply)

  protected def toUserFormData(user: User) = ProfileFormData(user)

  protected lazy val idapiErrorContextToFormFieldKeyMap = Map(
    "publicFields.location" -> "location",
    "publicFields.aboutMe" -> "aboutMe",
    "publicFields.interests" -> "interests",
    "publicFields.username" -> "username",
  )
}

case class ProfileFormData(
    location: String,
    aboutMe: String,
    interests: String,
    username: String,
) extends UserFormData {

  def toUserUpdateDTO(currentUser: User): UserUpdateDTO =
    UserUpdateDTO(
      publicFields = Some(
        PublicFields(
          location = toUpdate(location, currentUser.publicFields.location),
          aboutMe = toUpdate(aboutMe, currentUser.publicFields.aboutMe),
          interests = toUpdate(interests, currentUser.publicFields.interests),
          username = toUpdate(username, currentUser.publicFields.username),
          displayName = toUpdate(username, currentUser.publicFields.username), // displayName == username
        ),
      ),
    )

}

object ProfileFormData {
  def apply(user: User): ProfileFormData =
    ProfileFormData(
      location = user.publicFields.location getOrElse "",
      aboutMe = user.publicFields.aboutMe getOrElse "",
      interests = user.publicFields.interests getOrElse "",
      username = user.publicFields.username getOrElse "",
    )
}
