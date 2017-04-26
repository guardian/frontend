package services

import play.api.mvc.Cookie
import client.Response
import scala.concurrent.Future
import utils.SafeLogging
import org.joda.time.{Seconds, DateTime}
import conf.IdentityConfiguration
import idapiclient.responses.CookiesResponse
import common.ExecutionContexts

class PlaySigninService(conf: IdentityConfiguration) extends SafeLogging with ExecutionContexts {
  def getCookies(cookiesResponse: Future[Response[CookiesResponse]], rememberMe: Boolean): Future[Response[List[Cookie]]] = {
    cookiesResponse map {
      _.right.map { apiCookies =>
        val maxAge = if(rememberMe) Some(Seconds.secondsBetween(DateTime.now, apiCookies.expiresAt).getSeconds) else None
        apiCookies.values.map { cookie =>
          val secureHttpOnly = cookie.key.startsWith("SC_")
          val cookieMaxAgeOpt = maxAge.filterNot(_ => cookie.isSessionCookie)

          Cookie(cookie.key, cookie.value, cookieMaxAgeOpt, "/", Some(conf.domain), secureHttpOnly, secureHttpOnly)
        }
      }
    }
  }
}
