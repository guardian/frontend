package idapiclient.responses

import org.joda.time.DateTime

case class CookieResponse(key: String, value: String, sessionCookie: Option[Boolean]) {
  val isSessionCookie = sessionCookie.getOrElse(false)
}

case class CookiesResponse(expiresAt: DateTime, values: List[CookieResponse])
