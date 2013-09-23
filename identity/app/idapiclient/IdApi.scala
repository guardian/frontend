package idapiclient

import com.gu.identity.model.{LiftJsonConfig, User}
import client.{Anonymous, Auth, Response}
import client.connection.Http
import scala.concurrent.{Future, ExecutionContext}
import client.parser.{JodaJsonSerializer, JsonBodyParser}
import idapiclient.responses.{CookiesResponse, AccessTokenResponse}
import client.connection.util.ExecutionContexts
import net.liftweb.json.JsonAST.{JValue, JNothing}
import net.liftweb.json.Serialization.write
import utils.SafeLogging
import idapiclient.requests.TokenPassword


abstract class IdApi(apiRootUrl: String, http: Http, jsonBodyParser: JsonBodyParser, clientAuth: Auth) extends SafeLogging {
  implicit def executionContext: ExecutionContext
  implicit val formats = LiftJsonConfig.formats + new JodaJsonSerializer


  protected def apiUrl(path: String) = urlJoin(apiRootUrl, path)

  protected def urlJoin(pathParts: String*) = {
    pathParts.filter(_.nonEmpty).map(slug => {
      slug.stripPrefix("/").stripSuffix("/")
    }) mkString "/"
  }

  def jsonField(field: String)(json: JValue): JValue = json \ field

  // AUTH

  def authApp(auth: Auth, trackingData: OmnitureTracking): Future[Response[AccessTokenResponse]] = {
    val response = http.GET(apiUrl("auth"), auth.parameters ++ trackingData.parameters ++ clientAuth.parameters, auth.headers ++ clientAuth.headers)
    response map jsonBodyParser.extract[AccessTokenResponse](jsonField("accessToken"))
  }

  def authBrowser(userAuth: Auth, trackingData: OmnitureTracking): Future[Response[CookiesResponse]] = {
    val params = userAuth.parameters ++ trackingData.parameters ++ clientAuth.parameters ++ Iterable(("format", "cookies"))
    val response = http.POST(apiUrl("auth"), None, params, userAuth.headers ++ clientAuth.headers)
    response map jsonBodyParser.extract[CookiesResponse](jsonField("cookies"))
  }

  // USERS

  def user(userId: String, auth: Auth = Anonymous): Future[Response[User]] = {
    val apiPath = urlJoin("user", userId)
    val response = http.GET(apiUrl(apiPath), auth.parameters ++ clientAuth.parameters, auth.headers ++ clientAuth.headers)
    response map jsonBodyParser.extract[User](jsonField("user"))
  }

  def me(auth: Auth): Future[Response[User]] = {
    val apiPath = urlJoin("user", "me")
    val response = http.GET(apiUrl(apiPath), auth.parameters ++ clientAuth.parameters, auth.headers ++ clientAuth.headers)
    response map jsonBodyParser.extract[User](jsonField("user"))
  }

  // PASSWORD RESET

  def userForToken( token : String ): Future[Response[User]] = {
    val apiPath = urlJoin("pwd-reset", "user-for-token")
    val params = Iterable(("token", token))
    val response = http.GET(apiUrl(apiPath), params ++ clientAuth.parameters, clientAuth.headers)
    response map jsonBodyParser.extract[User](jsonField("user"))
  }

  def resetPassword( token : String, newPassword : String ): Future[Response[Unit]] = {
    val apiPath = urlJoin("pwd-reset", "reset-pwd-for-user")
    val postBody = write(TokenPassword(token, newPassword))
    val response = http.POST(apiUrl(apiPath), Some(postBody), clientAuth.parameters, clientAuth.headers)
    response map jsonBodyParser.extract[Unit]({_ => JNothing})
  }

  def sendPasswordResetEmail( emailAddress : String ): Future[Response[Unit]] = {
    val apiPath = urlJoin("pwd-reset","send-password-reset-email")
    val params = Iterable(("email-address", emailAddress), ("type", "reset"))
    val response = http.GET(apiUrl(apiPath), params ++ clientAuth.parameters, clientAuth.headers)
    response map jsonBodyParser.extract[Unit]({_ => JNothing})
  }

 def register(user: User, trackingParameters : OmnitureTracking, clientIp: Option[String]): Future[Response[User]] = {
    val userData = write(user)
    val response = http.POST(apiUrl("user"), Some(userData),
      clientAuth.parameters ++ trackingParameters.parameters,
      clientAuth.headers ++ clientIp.map(ip => Iterable("X-GU-ID-REMOTE-IP" -> ip)).getOrElse(Iterable.empty)
    )
    response map jsonBodyParser.extract[User](jsonField("user"))
  }

  // EMAILS

  // don't have a clear return type for this
  // def emailsForUser
  // ...etc
}

class SynchronousIdApi(apiRootUrl: String, http: Http, jsonBodyParser: JsonBodyParser, clientAuth: Auth)
  extends IdApi(apiRootUrl, http, jsonBodyParser, clientAuth) {
  implicit def executionContext: ExecutionContext = ExecutionContexts.currentThreadContext
}