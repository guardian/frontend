package form

import play.api.data.Forms
import play.api.data.Forms._
import com.gu.identity.model.{PrivateFields, PublicFields, User}
import idapiclient.UserUpdate

object ProfileMapping extends UserFormMapping[ProfileFormData] {

  private val genders = List("Male", "Female", "unknown", "")

  protected lazy val formMapping = mapping(
    "location" -> optionalTextField,
    "aboutMe" -> optional(text(maxLength = 1500)),
    "interests" -> optionalTextField,
    "webPage" -> optionalTextField,
    "gender" -> Forms.optional(Forms.text).verifying{genderOpt => genderOpt map (genders contains _) getOrElse true}
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
  location: Option[String],
  aboutMe: Option[String],
  interests: Option[String],
  webPage: Option[String],
  gender: Option[String]
){

  lazy val toUserUpdate: UserUpdate = UserUpdate(
    publicFields = Some(PublicFields(
      location = location,
      aboutMe = aboutMe,
      webPage = webPage,
      interests = interests
    )),
    privateFields = Some(PrivateFields(gender = this.gender))
  )

}

object ProfileFormData {
  def apply(user: User): ProfileFormData = ProfileFormData(
    location = user.publicFields.location,
    aboutMe = user.publicFields.aboutMe,
    interests = user.publicFields.interests,
    webPage = user.publicFields.webPage,
    gender = user.privateFields.gender
  )
}
