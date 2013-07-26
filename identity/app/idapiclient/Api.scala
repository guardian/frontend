package idapiclient

import client.connection.Http
import com.gu.identity.model.{User, AccessToken}
import client.auth.{Anonymous, Auth}
import client.Error
import play.mvc.Http.Cookie


abstract class Api(apiRootUrl: String, http: Http, jsonBodyParser: IdApiJsonBodyParser) {
  type Response[T] = Either[List[Error], T]

  private def prependSlashIfMissing(path: String) =
    if (path(0) == '/') path
    else "/" + path
  private def apiUrl(path: String) = apiRootUrl + "/" + path

  // AUTH

  def authApp(auth: Auth): Response[AccessToken] =
    {
      val response = http.GET(apiUrl("auth"), auth.parameters)
      jsonBodyParser.extract[AccessToken](response)
    }

  def authBrowser(auth: Auth): Response[List[Cookie]] = {
    val params = auth.parameters ++ List(("format", "cookie"))
    val response = http.GET(apiUrl("auth"), params)
    jsonBodyParser.extract[List[Cookie]](response)
  }

  // USERS

  def user(userId: String, path: Option[String] = None, auth: Auth = Anonymous): Response[User] = {
    val apiPath = "user/" + userId + path.map(prependSlashIfMissing).getOrElse("")
    val response = http.GET(apiPath, auth.parameters)
    jsonBodyParser.extract[User](response)
  }

  def me(auth: Auth, path: Option[String] = None): Response[User] = {
    val apiPath = "user/me" + path.map(prependSlashIfMissing).getOrElse("")
    val response = http.GET(apiPath, auth.parameters)
    jsonBodyParser.extract[User](response)
  }

  def register(userData: String): Response[User] = {
    val response = http.POST("user", userData)
    jsonBodyParser.extract[User](response)
  }

  // TODO: require public "/user" in ID API
//  def findUser(): Response[User]
//  def findUsers(): Response[User]

  // EMAILS

  // don't have a clear return type for this
  def emailsForUser
  // ...etc
}
