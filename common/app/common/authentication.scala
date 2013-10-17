package controllers

import common.{FaciaToolMetrics, ExecutionContexts, Logging}
import net.liftweb.json.{ Serialization, NoTypeHints }
import net.liftweb.json.Serialization.{ read, write }
import play.api.mvc._
import play.api.mvc.Results._
import play.api.Play
import scala.concurrent.Future
import play.api.libs.openid.OpenID
import conf.Configuration
import org.joda.time.DateTime

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

  def apply(request: Request[Any]): Option[Identity] = {
    request.session.get(KEY).map(credentials => Identity.readJson(credentials))
  }
}

class AuthenticatedRequest(val identity: Identity, request: Request[AnyContent]) extends WrappedRequest(request)

trait AuthLogging {
  self: Logging =>
  def log(msg: String, request: Request[AnyContent]) {
    request match {
      case auth: AuthenticatedRequest => log.info(auth.identity.email + ": " + msg)
      case _ => throw new IllegalStateException("Expected an authenticated request")
    }
  }
}

class ExpiringAuthAction(loginUrl: String) extends AuthAction(loginUrl) with implicits.Dates {
  import Play.current

  def authFailResult(request: Request[AnyContent]): SimpleResult = Redirect(loginUrl).withSession(("loginFromUrl", request.uri))

  override def apply(f: Request[AnyContent] => SimpleResult) = async(request => Future.apply(f(request)))

  override def async(f: Request[AnyContent] => Future[SimpleResult]): Action[AnyContent] = super.async { request =>

    if (withinAllowedTime(request) || Play.isTest) {
      f(request).map(_.withSession(request.session + (Configuration.cookies.lastSeenKey , DateTime.now.toString)))
    }
    else {
       FaciaToolMetrics.ExpiredRequestCount.increment()
       Future { authFailResult(request) }
    }
  }

  def withinAllowedTime(request: Request[AnyContent]): Boolean =
    request.session.get(Configuration.cookies.lastSeenKey).map(new DateTime(_)).exists(_.age < Configuration.cookies.sessionExpiryTime)
}

class AuthAction(loginUrl: String) extends ExecutionContexts {
  import Play.current

  def apply(f: Request[AnyContent] => SimpleResult): Action[AnyContent] = async(request => Future { f(request) })

  def async(f: Request[AnyContent] => Future[SimpleResult]): Action[AnyContent] = Action.async {

      request: Request[AnyContent] =>

      val identity: Option[Identity] = Identity(request)
      identity match {
        case Some(id) => f(new AuthenticatedRequest(id, request))
        case _ if Play.isTest => f(new AuthenticatedRequest(Identity("1234", "foo@bar.com", "John", "Smith"), request))
        case _ => Future(Redirect(loginUrl).withSession(request.session + ("loginFromUrl", request.uri)))
      }
    }
}

trait LoginController extends ExecutionContexts { self: Controller =>
  import Play.current

  val openIdAttributes = Seq(
    ("email", "http://axschema.org/contact/email"),
    ("firstname", "http://axschema.org/namePerson/first"),
    ("lastname", "http://axschema.org/namePerson/last")
  )
  val extraOpenIDParameters: Seq[String] = Nil
  val googleOpenIdUrl = "https://www.google.com/accounts/o8/id"

  val loginUrl: String
  val baseUrl: String //Where to go if there is no loginFromUrl

  def openIdCallback(secure: Boolean)(implicit request: RequestHeader): String
  def login: Action[AnyContent]

  def loginPost = Action.async { implicit request =>
    val secure: Boolean = !Play.isDev
    OpenID
      .redirectURL(googleOpenIdUrl, openIdCallback(secure=secure), openIdAttributes)
      .map(_ + extraOpenIDParameters.mkString("&", "&", ""))
      .map(Redirect(_))
      .recover {
      case error => Redirect(loginUrl).flashing(("error" -> "Unknown error: %s ".format(error.getMessage)))
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
      val isTestUser = (credentials.email == "test.automation@gutest.com" && Configuration.environment.isNonProd)

      if (credentials.emailDomain == "guardian.co.uk" || isTestUser) {
        Redirect(session.get("loginFromUrl").getOrElse(baseUrl)).withSession {
          session +
           (Identity.KEY -> credentials.writeJson) +
            (Configuration.cookies.lastSeenKey -> DateTime.now.toString) -
            "loginFromUrl"
        }
      } else {
        Redirect(loginUrl).flashing(
          ("error" -> "You can only log in using a Guardian Google Account")
        ).withSession(session - Identity.KEY)
      }
    }.recover {
      case error => Redirect(loginUrl).flashing(("error" -> "Unknown error: %s ".format(error.getMessage)))
    }
  }

  def logout = Action { implicit request =>
    Redirect(loginUrl).withNewSession
  }
}
