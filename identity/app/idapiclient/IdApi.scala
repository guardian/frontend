package idapiclient

import scala.language.higherKinds
import com.gu.identity.model.{User, AccessToken}
import play.mvc.Http.Cookie
import client.{Anonymous, Auth, Response}
import client.connection.Http
import client.util.{Monad, MonadInstances, Id}
import scala.concurrent.{Future, ExecutionContext}
import client.parser.JsonBodyParser
import idapiclient.responses.AccessTokenResponse


abstract class IdApi[F[_]](apiRootUrl: String, http: Http[F], jsonBodyParser: JsonBodyParser) {
  import client.util.MonadOps._

  implicit def M: Monad[F]

  protected def apiUrl(path: String) = urlJoin(apiRootUrl, path)

  protected def urlJoin(pathParts: String*) = {
    pathParts.filter(_.nonEmpty).map(slug => {
      slug.stripPrefix("/").stripSuffix("/")
    }) mkString "/"
  }

  // AUTH

  def authApp(auth: Auth): F[Response[AccessTokenResponse]] = {
    val response = http.GET(apiUrl("auth"), auth.parameters, auth.headers)
    response map jsonBodyParser.extract[AccessTokenResponse]
  }

  def authBrowser(auth: Auth): F[Response[List[Cookie]]] = {
    val params = auth.parameters ++ List(("format", "cookie"))
    val response = http.GET(apiUrl("auth"), params)
    response map jsonBodyParser.extract[List[Cookie]]
  }

  // USERS

  def user(userId: String, path: Option[String] = None, auth: Auth = Anonymous): F[Response[User]] = {
    val apiPath = urlJoin("user", userId, path.getOrElse(""))
    val response = http.GET(apiUrl(apiPath), auth.parameters, auth.headers)
    response map jsonBodyParser.extract[User]
  }

  def me(auth: Auth, path: Option[String] = None): F[Response[User]] = {
    val apiPath = urlJoin("user", "me", path.getOrElse(""))
    val response = http.GET(apiUrl(apiPath), auth.parameters, auth.headers)
    response map jsonBodyParser.extract[User]
  }

  def register(userData: String): F[Response[User]] = {
    val response = http.POST(apiUrl("user"), userData)
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
class SyncIdApi(apiRootUrl: String, http: Http[Id], jsonBodyParser: JsonBodyParser)
  extends IdApi[Id](apiRootUrl, http, jsonBodyParser) {

  implicit val M = MonadInstances.idMonad
}

/** Base class for Future-based async clients */
abstract class AsyncIdApi(apiRootUrl: String, http: Http[Future], jsonBodyParser: JsonBodyParser)
  extends IdApi[Future](apiRootUrl, http, jsonBodyParser) {

  implicit def executionContext: ExecutionContext
  implicit def M = MonadInstances.futureMonad(executionContext)
}
