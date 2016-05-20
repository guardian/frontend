package model.deploys

import play.api.libs.ws.{WSResponse, WS}
import scala.concurrent.Future
import play.api.Play.current

trait HttpClient {

  def GET(url: String, queryString: Map[String, String] = Map.empty, headers: Map[String, String] = Map.empty): Future[WSResponse] = {
    WS.url(url).withQueryString(queryString.toSeq: _*).withHeaders(headers.toSeq: _*).withRequestTimeout(10000).get()
  }

}
object HttpClient extends HttpClient
