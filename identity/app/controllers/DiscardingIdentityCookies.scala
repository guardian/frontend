package controllers

import java.time.Instant
import java.time.temporal.ChronoUnit

import play.api.mvc.{Cookie, DiscardingCookie, Result}

object DiscardingIdentityCookies {
  def apply(result: Result): Result = result.discardingCookies(
    DiscardingCookie("SC_GU_U"), DiscardingCookie("GU_U"), DiscardingCookie("SC_GU_RP")
  ).withCookies(
    Cookie(
      "GU_SO",
      Instant.now().getEpochSecond.toString,
      Some(Instant.now().plus(90, ChronoUnit.DAYS).getEpochSecond.toInt),
      secure = true
    )
  )
}
