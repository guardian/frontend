package form

import play.api.data.Forms._
import com.gu.identity.model.{PublicFields, User}
import idapiclient.UserUpdate
import play.api.i18n.MessagesApi

class ProfileMapping(val messagesApi: MessagesApi) extends UserFormMapping[ProfileFormData] {

  protected lazy val formMapping = mapping(
    "location" -> textField,
    "aboutMe" -> textArea,
    "interests" -> textField,
    "username" -> textField
  )(ProfileFormData.apply)(ProfileFormData.unapply)

  protected def fromUser(user: User) = ProfileFormData(user)

  protected lazy val contextMap =  Map(
    "publicFields.location" -> "location",
    "publicFields.aboutMe" -> "aboutMe",
    "publicFields.interests" -> "interests",
    "publicFields.username" -> "username"
  )
}

case class ProfileFormData(
  location: String,
  aboutMe: String,
  interests: String,
  username: String
) extends UserFormData{

  def toUserUpdate(currentUser: User): UserUpdate = UserUpdate(
    publicFields = Some(PublicFields(
      location = toUpdate(location, currentUser.publicFields.location),
      aboutMe = toUpdate(aboutMe, currentUser.publicFields.aboutMe),
      interests = toUpdate(interests, currentUser.publicFields.interests),
      username = toUpdate(username, currentUser.publicFields.username),
      displayName = toUpdate(username, currentUser.publicFields.username) // displayName == username
    ))
  )

}

object ProfileFormData {
  def apply(user: User): ProfileFormData = ProfileFormData(
    location = user.publicFields.location getOrElse "",
    aboutMe = user.publicFields.aboutMe getOrElse "",
    interests = user.publicFields.interests getOrElse "",
    username = user.publicFields.username getOrElse ""
  )
}
