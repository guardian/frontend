package idapiclient.responses

import org.joda.time.DateTime

case class CookieResponse(name: String, value: String)
case class CookiesResponse(expiry: DateTime, values: List[CookieResponse])
