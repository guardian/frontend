package client

import client.connection.Http
import com.gu.identity.model.{AccessToken, ErrorResponse}
import play.mvc.Http.Cookie
import client.auth.Auth

abstract class Api(apiRootUrl: String, http: Http) {
  type Response[T] = Either[ErrorResponse, T]

  private def apiUrl(path: String) = apiRootUrl + "/" + path

  def authApp(auth: Auth): Response[AccessToken] = {
    http.GET(apiUrl("auth"), auth.parameters).extract[AccessToken]
  }

  def authBrowser(auth: Auth): Response[List[Cookie]] = {
    val params = auth.parameters ++ List(("format", "cookie"))
    http.GET(apiUrl("auth"), params).extract[List[Cookie]]
  }
}
