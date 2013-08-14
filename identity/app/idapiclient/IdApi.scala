package idapiclient

import com.gu.identity.model.User
import client.{Logging, Anonymous, Auth, Response}
import client.connection.Http
import scala.concurrent.{Future, ExecutionContext}
import client.parser.JsonBodyParser
import idapiclient.responses.{CookiesResponse, AccessTokenResponse}
import client.connection.util.ExecutionContexts
import net.liftweb.json.JsonAST.JValue
import utils.SafeLogging


abstract class IdApi(apiRootUrl: String, http: Http, jsonBodyParser: JsonBodyParser) extends SafeLogging {
  implicit def executionContext: ExecutionContext

  protected def apiUrl(path: String) = urlJoin(apiRootUrl, path)

  protected def urlJoin(pathParts: String*) = {
    pathParts.filter(_.nonEmpty).map(slug => {
      slug.stripPrefix("/").stripSuffix("/")
    }) mkString "/"
  }

  def jsonField(field: String)(json: JValue): JValue = json \ field

  // AUTH

  def authApp(auth: Auth, trackingData: OmnitureTracking): Future[Response[AccessTokenResponse]] = {
    val response = http.GET(apiUrl("auth"), auth.parameters ++ trackingData.parameters, auth.headers)
    response map jsonBodyParser.extract[AccessTokenResponse](jsonField("accessToken"))
  }

  def authBrowser(userAuth: Auth, clientAuth: ClientAuth, trackingData: OmnitureTracking): Future[Response[CookiesResponse]] = {
    val params = userAuth.parameters ++ trackingData.parameters ++ clientAuth.parameters ++ Iterable(("format", "cookies"))
    val response = http.POST(apiUrl("auth"), None, params, userAuth.headers ++ clientAuth.headers)
    response map jsonBodyParser.extract[CookiesResponse](jsonField("cookies"))
  }

  // USERS

  def user(userId: String, auth: Auth = Anonymous): Future[Response[User]] = {
    val apiPath = urlJoin("user", userId)
    val response = http.GET(apiUrl(apiPath), auth.parameters, auth.headers)
    response map jsonBodyParser.extract[User](jsonField("user"))
  }

  def me(auth: Auth): Future[Response[User]] = {
    val apiPath = urlJoin("user", "me")
    val response = http.GET(apiUrl(apiPath), auth.parameters, auth.headers)
    response map jsonBodyParser.extract[User](jsonField("user"))
  }

//  def register(userData: String): Future[Response[User]] = {
//    val response = http.POST(apiUrl("user"), userData)
//    response map jsonBodyParser.extract[User](jsonField("user"))
//  }

  // EMAILS

  // don't have a clear return type for this
  // def emailsForUser
  // ...etc
}

class SynchronousIdApi(apiRootUrl: String, http: Http, jsonBodyParser: JsonBodyParser)
  extends IdApi(apiRootUrl, http, jsonBodyParser) {
  implicit def executionContext: ExecutionContext = ExecutionContexts.currentThreadContext
}
