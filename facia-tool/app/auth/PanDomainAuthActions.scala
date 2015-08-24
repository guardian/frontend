package auth

import com.amazonaws.auth.BasicAWSCredentials
import conf.Configuration
import com.gu.pandomainauth.action.AuthActions
import com.gu.pandomainauth.model.AuthenticatedUser
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import play.api.Logger
import play.api.mvc._

trait PanDomainAuthActions extends AuthActions with Results {
  import play.api.Play.current
  lazy val config = play.api.Play.configuration

  override def validateUser(authedUser: AuthenticatedUser): Boolean = {
    (authedUser.user.emailDomain == "guardian.co.uk" ||
      authedUser.user.emailDomain == "guardian.com") &&
      (authedUser.multiFactor || (config.getString("no2faUser").exists(user => user.length > 0 && user == authedUser.user.email)))
  }

  override def authCallbackUrl: String = Configuration.faciatool.pandomainHost.get + "/oauthCallback"

  override def showUnauthedMessage(message: String)(implicit request: RequestHeader): Result = {
    Logger.info(message)
    Ok(views.html.auth.login(Some(message)))
  }

  import com.gu.pandomainauth.service.CookieUtils
  override def readAuthenticatedUser(request: RequestHeader): Option[AuthenticatedUser] = readCookie(request) map { cookie =>
      CookieUtils.parseCookieData(cookie.value, settings.secret)
  }

  override def invalidUserMessage(claimedAuth: AuthenticatedUser): String = {
    if( (claimedAuth.user.emailDomain == "guardian.co.uk") && !claimedAuth.multiFactor) {
      s"${claimedAuth.user.email} is not valid for use with the Fronts Tool as you need to have two factor authentication enabled." +
       s" Please contact the Helpdesk by emailing 34444@theguardian.com or calling 34444 and request access to Composer CMS tools."
    } else {
      s"${claimedAuth.user.email} is not valid for use with the Fronts Tool. You need to use your Guardian Google account to login. Please sign in with your Guardian Google account first, then retry logging in."
    }
  }

  override lazy val domain: String = Configuration.faciatool.pandomainDomain.get
  override lazy val system: String = "fronts"

  override lazy val awsCredentials =
    for (key <- Configuration.faciatool.pandomainKey; secret <- Configuration.faciatool.pandomainSecret)
      yield { new BasicAWSCredentials(key, secret) }
}
