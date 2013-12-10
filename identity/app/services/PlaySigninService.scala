package services

import com.google.inject.{Singleton, Inject}
import play.api.mvc.Cookie
import client.Response
import scala.concurrent.Future
import utils.SafeLogging
import org.joda.time.{Seconds, DateTime}
import conf.IdentityConfiguration
import idapiclient.responses.CookiesResponse
import common.ExecutionContexts

@Singleton
class PlaySigninService @Inject()(conf: IdentityConfiguration) extends SafeLogging with ExecutionContexts {
  def getCookies(cookiesResponse: Future[Response[CookiesResponse]], rememberMe: Boolean): Future[Response[List[Cookie]]] = {
    cookiesResponse map {
      _.right.map { apiCookies =>
        val maxAge = if(rememberMe) Some(Seconds.secondsBetween(DateTime.now, apiCookies.expiresAt).getSeconds) else None
        apiCookies.values.map { cookie =>
          val secureHttpOnly = cookie.key.startsWith("SC_")
          new Cookie(cookie.key, cookie.value, maxAge, "/", Some(conf.id.domain), secureHttpOnly, secureHttpOnly)
        }
      }
    }
  }
}
