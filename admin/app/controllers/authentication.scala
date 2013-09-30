package controllers

import conf.Configuration
import common.{ ExecutionContexts, Logging }
import net.liftweb.json.{ Serialization, NoTypeHints }
import net.liftweb.json.Serialization.{ read, write }
import play.api.mvc._
import play.api.mvc.Results._
import play.api.mvc.BodyParsers._
import play.api.libs.openid.OpenID
import play.api.Play
import scala.concurrent.Future

case class Identity(openid: String, email: String, firstName: String, lastName: String) {
  implicit val formats = Serialization.formats(NoTypeHints)

  def writeJson = write(this)

  lazy val fullName = firstName + " " + lastName
  lazy val emailDomain = email.split("@").last
}

object Identity {
  val KEY = "identity"
  implicit val formats = Serialization.formats(NoTypeHints)

  def readJson(json: String) = read[Identity](json)

  def apply(request: Request[Any]): Option[Identity] = request match {
    case authenticated: AuthenticatedRequest[_] => authenticated.identity
    case _ => request.session.get(KEY).map(credentials => Identity.readJson(credentials))
  }
}

object AuthenticatedRequest {
  def apply[A](request: Request[A]) = {
    new AuthenticatedRequest(Identity(request), request)
  }
}

class AuthenticatedRequest[A](val identity: Option[Identity], request: Request[A]) extends WrappedRequest(request) {
  lazy val isAuthenticated = identity.isDefined
}

trait AuthLogging {
  self: Logging =>
  def log(msg: String, request: Request[AnyContent]) {
    request match {
      case auth: AuthenticatedRequest[_] => auth.identity.foreach(id => log.info(id.email + ": " + msg))
      case _ => throw new IllegalStateException("Expected an authenticated request")
    }
  }
}

object NonAuthAction {

  def apply[A](p: BodyParser[A])(f: AuthenticatedRequest[A] => Result) = {
    Action(p) {
      implicit request => f(AuthenticatedRequest(request))
    }
  }

  def apply(f: AuthenticatedRequest[AnyContent] => Result): Action[AnyContent] = {
    this.apply(parse.anyContent)(f)
  }

  def apply(block: => Result): Action[AnyContent] = {
    this.apply(_ => block)
  }

}

object Authenticated extends ExecutionContexts {
  import Play.current

  def apply(f: Request[AnyContent] => SimpleResult): Action[AnyContent] = async(request => Future { f(request) })

  def async(f: Request[AnyContent] => Future[SimpleResult]): Action[AnyContent] = Action.async { _ match {
      case authenticatedRequest: AuthenticatedRequest[_] => f(authenticatedRequest)

      case request if Play.isTest =>
        val stubbedIdentity = new AuthenticatedRequest(Some(Identity("1234", "foo@bar.com", "John", "Smith")), request)
        f(stubbedIdentity)

      case request =>
        val authenticatedRequest = Identity(request) map { id => f(new AuthenticatedRequest(Some(id), request)) }
        authenticatedRequest getOrElse { Future {
            Redirect(routes.Login.login).withSession(request.session + ("loginFromUrl", request.uri))
          }
        }
    }
  }
}

object Login extends Controller with ExecutionContexts {
  val openIdAttributes = Seq(
    ("email", "http://axschema.org/contact/email"),
    ("firstname", "http://axschema.org/namePerson/first"),
    ("lastname", "http://axschema.org/namePerson/last")
  )
  val googleOpenIdUrl = "https://www.google.com/accounts/o8/id"

  def login = NonAuthAction {
    request =>
      val error = request.flash.get("error")
      Ok(views.html.auth.login(request, error, Configuration.environment.stage))
  }

  def loginPost = Action.async { implicit request =>
    OpenID
      .redirectURL(googleOpenIdUrl, routes.Login.openIDCallback.absoluteURL(secure = true), openIdAttributes)
      .map(Redirect(_))
      .recover {
      case error => Redirect(routes.Login.login).flashing(("error" -> "Unknown error: %s ".format(error.getMessage)))
    }
  }

  def openIDCallback = Action.async { implicit request =>
    OpenID.verifiedId.map { info =>
      val credentials = Identity(
        info.id,
        info.attributes.get("email").get,
        info.attributes.get("firstname").get,
        info.attributes.get("lastname").get
      )

      // allow test user access
      val isTestUser = (credentials.email == "test.automation@gutest.com" && List("dev", "code", "gudev").contains(Configuration.environment.stage.toLowerCase))

      if (credentials.emailDomain == "guardian.co.uk" || isTestUser) {
        Redirect(session.get("loginFromUrl").getOrElse("/admin")).withSession {
          session + (Identity.KEY -> credentials.writeJson) - "loginFromUrl"
        }
      } else {
        Redirect(routes.Login.login).flashing(
          ("error" -> "You can only log in using a Guardian Google Account")
        ).withSession(session - Identity.KEY)
      }
    }.recover {
      case error => Redirect(routes.Login.login).flashing(("error" -> "Unknown error: %s ".format(error.getMessage)))
    }
  }

  def logout = Action { implicit request =>
    Redirect("/login").withNewSession
  }
}
