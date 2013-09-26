package discussion
package model

import play.api.libs.json.JsValue

case class Profile(
  avatar: String,
  displayName: String,
  isStaff: Boolean = false,
  isContributor: Boolean = false
)

object Profile {

  def apply(json: JsValue): Profile = {
    val badges = json \ "userProfile" \ "badge" \\ "name"
    Profile(
      avatar = (json \ "userProfile" \ "avatar").as[String],
      displayName = (json \ "userProfile" \ "displayName").as[String],
      isStaff = badges.exists(_.as[String] == "Staff"),
      isContributor = badges.exists(_.as[String] == "Contributor")
    )
  }
}
