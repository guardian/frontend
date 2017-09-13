package services

import common.Logging
import conf.Configuration
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration.{Duration, DurationInt}


object URLResponseDeserializer {
  implicit val jsonShare = Json.reads[ShareObject]
  implicit val jsonResponse = Json.reads[URLResponse]
}

case class URLResponse(id: String, share: ShareObject)
case class ShareObject(share_count: Int)

class FacebookGraphApiClient(wsClient: WSClient) extends implicits.WSRequests with Logging {
  val apiRootUrl = s"https://graph.facebook.com/v${Configuration.facebook.graphApi.version}/"

  def GET(endpoint: Option[String], timeout: Duration, queryString: (String, String)*)(implicit executionContext: ExecutionContext): Future[WSResponse] =
    wsClient
      .url(apiRootUrl + endpoint.getOrElse(""))
      .withQueryStringParameters(addAccessToken(queryString): _*)
      .withRequestTimeout(timeout)
      .getOKResponse()
      .recoverWith { case e: Exception =>
        log.error(s"Failed to fetch from Facebook Graph API endpoint: $endpoint", e)
        Future.failed(e)
      }

  protected def makeUrl(endpoint: Option[String]): String = apiRootUrl + endpoint.getOrElse("")
  private def addAccessToken(queryString: Seq[(String, String)]): Seq[(String, String)] =
    ("access_token", Configuration.facebook.graphApi.accessToken) +: queryString
}

class FacebookGraphApi(facebookGraphApiClient: FacebookGraphApiClient) {

  def shareCount(path: String)(implicit executionContext: ExecutionContext): Future[Int] = {
    import URLResponseDeserializer._

    facebookGraphApiClient.GET(
      endpoint = None,
      timeout = 1.second,
      // This has to be http so long as the og:url is (or the API changes again)
      queryString = ("id", s"http://www.theguardian.com/$path")
    ) map { response =>
      response.json.asOpt[URLResponse]
        .map(_.share.share_count)
        .getOrElse(0)
    }
  }
}
