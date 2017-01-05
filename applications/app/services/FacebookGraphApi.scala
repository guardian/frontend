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

  def GET[T](endpoint: Option[String], queryString: (String, String)*)(asResult: WSResponse => T) =
    wsClient
      .url(apiRootUrl + endpoint.getOrElse(""))
      .withQueryString(augmentParams(queryString): _*)
      .getOKResponse()
      .map(asResult)

  protected def makeUrl(endpoint: Option[String]) = apiRootUrl + endpoint.getOrElse("")
  protected def augmentParams(queryString: Seq[(String, String)]) =
    ("access_token", Configuration.facebook.graphApi.accessToken) +: queryString
}

class FacebookGraphApi(facebookGraphApiClient: FacebookGraphApiClient) {

  def shareCount(path: String): Future[Int] = {
    import URLResponseDeserializer._

    facebookGraphApiClient.GET[Int](
      endpoint = None,
      queryString = ("id", s"https://www.theguardian.com/$path")
    ) { response =>
      response.json.asOpt[URLResponse]
        .map(_.share.share_count)
        .getOrElse(0)
    }
  }
}
