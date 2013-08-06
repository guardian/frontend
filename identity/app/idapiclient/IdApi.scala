package idapiclient

import com.gu.identity.model.{User, AccessToken}
import play.mvc.Http.Cookie
import client.{Anonymous, Auth, Response}
import client.connection.{HttpResponse, Http}
import scala.concurrent.{Promise, Future, ExecutionContext}
import client.parser.JsonBodyParser
import idapiclient.responses.{CookiesResponse, CookieResponse, AccessTokenResponse}
import client.connection.util.ExecutionContexts
import model.OkResponse


abstract class IdApi(apiRootUrl: String, http: Http, jsonBodyParser: JsonBodyParser) {
  implicit def executionContext: ExecutionContext

  protected def apiUrl(path: String) = urlJoin(apiRootUrl, path)

  protected def urlJoin(pathParts: String*) = {
    pathParts.filter(_.nonEmpty).map(slug => {                         0
      slug.stripPrefix("/").stripSuffix("/")
    }) mkString "/"
  }

  // AUTH

  def authApp(auth: Auth): Future[Response[AccessTokenResponse]] = {
    val response = http.GET(apiUrl("auth"), auth.parameters, auth.headers)
    response map jsonBodyParser.extract[AccessTokenResponse]
  }

  def authBrowser(auth: Auth): Future[Response[List[CookieResponse]]] = {
    val params = auth.parameters ++ Iterable(("format", "cookie"))
    val response = http.GET(apiUrl("auth"), params, auth.headers)
    val cookieResponse = response map jsonBodyParser.extract[CookiesResponse]
    cookieResponse.map(_.right.map(_.values))
  }

  // USERS

  def user(userId: String, auth: Auth = Anonymous): Future[Response[User]] = {
    val apiPath = urlJoin("user", userId)
    val response = http.GET(apiUrl(apiPath), auth.parameters, auth.headers)
    response map jsonBodyParser.extract[User]
  }

  def me(auth: Auth): Future[Response[User]] = {
    val apiPath = urlJoin("user", "me")
    val response = http.GET(apiUrl(apiPath), auth.parameters, auth.headers)
    response map jsonBodyParser.extract[User]
  }

  //TODO - rename
  def email(auth: Auth): Future[Response[User]] = {
    val apiPath = urlJoin("user")
    val response = http.GET(apiUrl(apiPath), auth.parameters, auth.headers)
    response map jsonBodyParser.extract[User]

  }

  //Change password

  //TODO - changew to use authObject
  def userForToken( token : String, auth: Auth = Anonymous ): Future[Response[User]] = {
    val apiPath = urlJoin("user", "user-for-token")
    val params = auth.parameters ++ Iterable(("token", token))
    val response = http.GET(apiUrl(apiPath), params, auth.headers)
    response map jsonBodyParser.extract[User]
  }

  def changePassword( postBody : String, auth : Auth = Anonymous): Future[Response[OkResponse]] = {
    val apiPath = urlJoin("user", "reset-pwd-for-user")
    val response = http.POST(apiUrl(apiPath), postBody, auth.parameters, auth.headers)
    response map jsonBodyParser.extract[OkResponse]
  }

  //TODO -remove unused imports
  def sendPasswordResetEmail( auth : Auth ): Future[Response[OkResponse]] = {
    val apiPath = urlJoin("user","send-password-reset-email")
    val response = http.GET(apiUrl(apiPath), auth.parameters, auth.headers)
    response map jsonBodyParser.extract[OkResponse]

  }






//  def register(userData: String): Future[Response[User]] = {
//    val response = http.POST(apiUrl("user"), userData)
//    response map jsonBodyParser.extract[User]
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
