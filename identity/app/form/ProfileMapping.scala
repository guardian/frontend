package form

import play.api.data.Forms._
import com.gu.identity.model.{PrivateFields, PublicFields, User}
import idapiclient.UserUpdate

object ProfileMapping extends UserFormMapping[ProfileFormData] {

  private val genders = List("Male", "Female", "unknown", "")

  protected lazy val formMapping = mapping(
    "location" -> textField,
    "aboutMe" -> textArea,
    "interests" -> textField,
    "webPage" -> idUrl,
    "gender" -> comboList(genders)
  )(ProfileFormData.apply)(ProfileFormData.unapply)

  protected def fromUser(user: User) = ProfileFormData(user)

  protected lazy val contextMap =  Map(
    "publicFields.location" -> "location",
    "publicFields.aboutMe" -> "aboutMe",
    "publicFields.interests" -> "interests",
    "publicFields.webPage" -> "webPage",
    "privateFields.gender" -> "gender"
  )
}

trait ProfileMapping {
  val profileMapping = ProfileMapping
}

case class ProfileFormData(
  location: String,
  aboutMe: String,
  interests: String,
  webPage: String,
  gender: String
){

  lazy val toUserUpdate: UserUpdate = UserUpdate(
    publicFields = Some(PublicFields(
      location = Some(location),
      aboutMe = Some(aboutMe),
      webPage = Some(webPage),
      interests = Some(interests)
    )),
    privateFields = Some(PrivateFields(gender = Some(gender)))
  )

}

object ProfileFormData {
  def apply(user: User): ProfileFormData = ProfileFormData(
    location = user.publicFields.location getOrElse "",
    aboutMe = user.publicFields.aboutMe getOrElse "",
    interests = user.publicFields.interests getOrElse "",
    webPage = user.publicFields.webPage getOrElse "",
    gender = user.privateFields.gender getOrElse "unknown"
  )
}
