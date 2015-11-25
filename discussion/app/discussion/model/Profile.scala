package discussion
package model

import play.api.libs.json.{JsObject, JsValue}

case class Profile(
  userId: String,
  avatar: String,
  secureAvatar: String,
  displayName: String,
  isStaff: Boolean = false,
  isContributor: Boolean = false,
  privateFields: Option[PrivateProfileFields] = None
)

object Profile {
  lazy val empty = Profile("", "", "", "")

  def apply(json: JsValue): Profile = {
    val profileJson = json \ "userProfile"
    val badges = profileJson \ "badge" \\ "name"

    Profile(
      userId = (profileJson \ "userId").as[String],
      avatar = (profileJson \ "avatar").as[String],
      secureAvatar = (profileJson \ "secureAvatarUrl").as[String],
      displayName = (profileJson \ "displayName").as[String],
      isStaff = badges.exists(_.as[String] == "Staff"),
      isContributor = badges.exists(_.as[String] == "Contributor"),
      privateFields = getPrivateFields((profileJson \ "privateFields").toOption)
    )
  }

  private def getPrivateFields(json: Option[JsValue]): Option[PrivateProfileFields] = json match {
    case Some(obj:JsObject) => Some(PrivateProfileFields(obj))
    case _ => None
  }
}

case class PrivateProfileFields(canPostComment: Boolean, isPremoderated: Boolean, isSocial: Boolean)

object PrivateProfileFields{
  def apply(json: JsObject): PrivateProfileFields = {
    PrivateProfileFields(
      canPostComment = (json \\ "canPostComment") exists { _.as[Boolean] },
      isPremoderated = (json \\ "isPremoderated") exists { _.as[Boolean] },
      isSocial = (json \\ "isSocial") exists { _.as[Boolean] }
    )
  }
}
