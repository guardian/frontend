package idapiclient

import client.{Auth, Parameters}


class EmailPassword(email: String, password: String) extends Auth {
  override def parameters: Parameters = List(("email", email), ("password", password))
}

class UserToken(userAccessToken: String) extends Auth {
  override def parameters: Parameters = List(("accessToken", userAccessToken))
}

class UserCookie(cookieValue: String) extends Auth {
  override def parameters: Parameters = List(("SC_GU_U", cookieValue))
}

class UserTokenExchange(userAccessToken: String, clientId: String) extends Auth {
  override def parameters: Parameters = List(("user-access-token", userAccessToken), ("target-client-id", clientId))
}

abstract class SocialAccessToken(parameterName: String, accessToken: String) extends Auth {
  override def parameters: Parameters = List((parameterName, accessToken))
}
class FacebookToken(accessToken: String) extends SocialAccessToken("facebook-access-token", accessToken)

class GoogleToken(accessToken: String) extends SocialAccessToken("google-access-token", accessToken)

case class ClientAuth(clientAccessToken: String) extends Auth {
  def parameters: Parameters = List(("accessToken", clientAccessToken))
}
