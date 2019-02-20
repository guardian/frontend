package services

import play.api.mvc.Cookie
import idapiclient.Response

import scala.concurrent.{ExecutionContext, Future}
import utils.SafeLogging
import org.joda.time.{DateTime, Seconds}
import conf.IdentityConfiguration
import idapiclient.responses.CookiesResponse


class PlaySigninService(conf: IdentityConfiguration) extends SafeLogging {
  def getCookies(cookiesResponse: Future[Response[CookiesResponse]], rememberMe: Boolean)(implicit executionContext: ExecutionContext): Future[Response[List[Cookie]]] = {
    cookiesResponse map {
      _.right.map { apiCookies =>
        val maxAge = if(rememberMe) Some(Seconds.secondsBetween(DateTime.now, apiCookies.expiresAt).getSeconds) else None
        apiCookies.values.map { cookie =>
          val httpOnly = cookie.key.startsWith("SC_")
          val cookieMaxAgeOpt = maxAge.filterNot(_ => cookie.isSessionCookie)

          Cookie(cookie.key, cookie.value, cookieMaxAgeOpt, "/", Some(conf.domain), secure = true, httpOnly)
        }
      }
    }
  }
}
