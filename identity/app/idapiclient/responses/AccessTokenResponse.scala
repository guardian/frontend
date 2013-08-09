package idapiclient.responses

import org.joda.time.DateTime

case class AccessTokenResponse(accessToken: String, expiresAt: DateTime)
