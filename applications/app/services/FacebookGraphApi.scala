package services

import common.ExecutionContexts
import conf.Configuration
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}
import scala.concurrent.Future


object URLResponseDeserializer {
  implicit val jsonShare = Json.reads[ShareObject]
  implicit val jsonResponse = Json.reads[URLResponse]
}

case class URLResponse(id: String, share: ShareObject)
case class ShareObject(share_count: Int)

class FacebookGraphApiClient(wsClient: WSClient) extends implicits.WSRequests with ExecutionContexts {
  val apiRootUrl = s"https://graph.facebook.com/v${Configuration.facebook.graphApi.version}/"

  def GET(endpoint: Option[String], queryString: (String, String)*) =
    wsClient
      .url(apiRootUrl + endpoint.getOrElse(""))
      .withQueryString(addAccessToken(queryString): _*)
      .getOKResponse()

  protected def makeUrl(endpoint: Option[String]) = apiRootUrl + endpoint.getOrElse("")
  private def addAccessToken(queryString: Seq[(String, String)]) =
    ("access_token", Configuration.facebook.graphApi.accessToken) +: queryString
}

class FacebookGraphApi(facebookGraphApiClient: FacebookGraphApiClient) extends ExecutionContexts {

  def shareCount(path: String): Future[Int] = {
    import URLResponseDeserializer._

    facebookGraphApiClient.GET(
      endpoint = None,
      queryString = ("id", s"https://www.theguardian.com/$path")
    ) map { response =>
      response.json.asOpt[URLResponse]
        .map(_.share.share_count)
        .getOrElse(0)
    }
  }
}
