package idapiclient.responses

import org.joda.time.DateTime

case class CookieResponse(key: String, value: String)
case class CookiesResponse(expiresAt: DateTime, values: List[CookieResponse])
