package services

import java.util.concurrent.TimeoutException

import common.GuLogging
import conf.Configuration
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration.{Duration, DurationInt}

object URLResponseDeserializer {
  implicit val jsonEngagement = Json.reads[Engagement]
  implicit val jsonResponse = Json.reads[URLResponse]
}

case class Engagement(share_count: Int)
case class URLResponse(id: String, engagement: Engagement)

class FacebookGraphApiClient(wsClient: WSClient) extends implicits.WSRequests with GuLogging {
  val apiRootUrl = s"https://graph.facebook.com/v${Configuration.facebook.graphApi.version}"

  def GET(endpoint: Option[String], timeout: Duration, queryString: (String, String)*)(implicit
      executionContext: ExecutionContext,
  ): Future[WSResponse] = {
    val url = apiRootUrl + endpoint.getOrElse("")
    val res = wsClient
      .url(url)
      .withQueryStringParameters(addAccessToken(queryString): _*)
      .withRequestTimeout(timeout)
      .getOKResponse()
    res.failed.foreach {
      case t: TimeoutException => log.warn(s"Timeout when fetching Facebook Graph API: $url", t)
      case t                   => log.error(s"Failed to fetch from Facebook Graph API: $url", t)
    }
    res
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
      queryString = ("id", s"http://www.theguardian.com/$path"),
      ("fields", "engagement"),
    ) map { response =>
      response.json
        .asOpt[URLResponse]
        .map(_.engagement.share_count)
        .getOrElse(0)
    }
  }
}
