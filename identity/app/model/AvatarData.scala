package model

import conf.Configuration

object AvatarData {
  def apply(user: com.gu.identity.model.User): AvatarData =
    AvatarData(user.getPublicFields.getDisplayName, user.getId(), Configuration.avatars.imageHost)
}

case class AvatarData(userName: String, userId: String, imageHost: String) {
  val jsonFormat = "{\"username\":\"%s\",\"user_id\":\"%s\",\"required_image_host\":\"%s\",\"is_social\":false}"

  def toJson = jsonFormat.format(userName, userId, imageHost)
}
