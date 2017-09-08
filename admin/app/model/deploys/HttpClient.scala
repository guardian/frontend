package model.deploys

import play.api.libs.ws.{WSResponse, WSClient}
import scala.concurrent.Future

import scala.concurrent.duration._

trait HttpLike {
  def GET(url: String, queryString: Map[String, String] = Map.empty, headers: Map[String, String] = Map.empty): Future[WSResponse]
}

class HttpClient(wsClient: WSClient) extends HttpLike {

  override def GET(url: String, queryString: Map[String, String] = Map.empty, headers: Map[String, String] = Map.empty): Future[WSResponse] = {
    wsClient.url(url).withQueryString(queryString.toSeq: _*).withHeaders(headers.toSeq: _*).withRequestTimeout(10.seconds).get()
  }

}
