package idapiclient

import com.gu.identity.model.{User, AccessToken}
import play.mvc.Http.Cookie
import client.{Logging, Anonymous, Auth, Response}
import client.connection.Http
import scala.concurrent.{Future, ExecutionContext}
import client.parser.JsonBodyParser
import idapiclient.responses.{CookiesResponse, CookieResponse, AccessTokenResponse}
import client.connection.util.ExecutionContexts


abstract class IdApi(apiRootUrl: String, http: Http, jsonBodyParser: JsonBodyParser) extends Logging {
  implicit def executionContext: ExecutionContext

  protected def apiUrl(path: String) = urlJoin(apiRootUrl, path)

  protected def urlJoin(pathParts: String*) = {
    pathParts.filter(_.nonEmpty).map(slug => {
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
    val response = http.POST(apiUrl("auth"), None, params, auth.headers)
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
