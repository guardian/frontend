package controllers

import java.time.Instant
import java.time.temporal.ChronoUnit

import conf.Configuration
import play.api.mvc.{Cookie, DiscardingCookie, Result}

object DiscardingIdentityCookies {

  def discardingCookieForRootDomain(name: String): DiscardingCookie =
    DiscardingCookie(name, secure = true, domain = Some(Configuration.id.domain))

  def apply(result: Result): Result =
    result
      .discardingCookies(
        discardingCookieForRootDomain("SC_GU_U"),
        discardingCookieForRootDomain("GU_U"),
        discardingCookieForRootDomain("SC_GU_RP"),
      )
      .withCookies(
        Cookie(
          "GU_SO",
          Instant.now().getEpochSecond.toString,
          Some(ChronoUnit.SECONDS.between(Instant.now(), Instant.now().plus(90, ChronoUnit.DAYS)).toInt),
          secure = true,
          domain = Some(Configuration.id.domain),
        ),
      )
}
