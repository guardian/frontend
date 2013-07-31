package idapiclient

import scala.language.higherKinds
import com.gu.identity.model.{User, AccessToken}
import play.mvc.Http.Cookie
import client.{Anonymous, Auth, Response}
import client.connection.Http
import client.util.{Monad, MonadInstances, Id}
import scala.concurrent.{Future, ExecutionContext}


abstract class IdApi[F[_]](apiRootUrl: String, http: Http[F], jsonBodyParser: IdApiJsonBodyParser) {
  import client.util.MonadOps._

  implicit def M: Monad[F]

  private def prependSlashIfMissing(path: String) =
    if (path(0) == '/') path
    else "/" + path
  private def apiUrl(path: String) = apiRootUrl + "/" + path

  // AUTH

  def authApp(auth: Auth): F[Response[AccessToken]] = {
    val response = http.GET(apiUrl("auth"), auth.parameters, auth.headers)
    response map jsonBodyParser.extract[AccessToken]
  }

  def authBrowser(auth: Auth): F[Response[List[Cookie]]] = {
    val params = auth.parameters ++ List(("format", "cookie"))
    val response = http.GET(apiUrl("auth"), params)
    response map jsonBodyParser.extract[List[Cookie]]
  }

  // USERS

  def user(userId: String, path: Option[String] = None, auth: Auth = Anonymous): F[Response[User]] = {
    val apiPath = "user/" + userId + path.map(prependSlashIfMissing).getOrElse("")
    val response = http.GET(apiPath, auth.parameters, auth.headers)
    response map jsonBodyParser.extract[User]
  }

  def me(auth: Auth, path: Option[String] = None): F[Response[User]] = {
    val apiPath = "user/me" + path.map(prependSlashIfMissing).getOrElse("")
    val response = http.GET(apiPath, auth.parameters, auth.headers)
    response map jsonBodyParser.extract[User]
  }

  def register(userData: String): F[Response[User]] = {
    val response = http.POST("user", userData)
    response map jsonBodyParser.extract[User]
  }

  // TODO: requires public "/user" in ID API
  // def findUser(): Response[User]
  // def findUsers(): Response[User]

  // EMAILS

  // don't have a clear return type for this
  // def emailsForUser
  // ...etc
}

/** Base class for blocking clients */
abstract class SyncIdApi(apiRootUrl: String, http: Http[Id], jsonBodyParser: IdApiJsonBodyParser)
  extends IdApi[Id](apiRootUrl, http, jsonBodyParser) {

  implicit val M = MonadInstances.idMonad
}

/** Base class for Future-based async clients */
abstract class AsyncIdApi(apiRootUrl: String, http: Http[Future], jsonBodyParser: IdApiJsonBodyParser)
  extends IdApi[Future](apiRootUrl, http, jsonBodyParser) {

  implicit def executionContext: ExecutionContext
  implicit def M = MonadInstances.futureMonad(executionContext)
}
