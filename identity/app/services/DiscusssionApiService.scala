package services

import play.api.libs.json.{Format, JsValue, Json}
import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import play.api.libs.ws.{WSClient, WSResponse}
import utils.SafeLogging
import cats.implicits._
import cats.data.EitherT

// A user will exist in Discussion if they have commented or recommended a comment.
// DAPI does not expose recommendation stats by user, so we rely on number of comments stat.
// A user needs 1 or more comments to have a public profile.
case class ProfileStats(status: String, comments: Int, pickedComments: Int) {
  def hasComments: Boolean = comments > 0 // Will be zero for users who have recommended but not commented.
}

object ProfileStats {
  implicit val format: Format[ProfileStats] = Json.format[ProfileStats]
}

case class DiscussionApiServiceException(message: String) extends Throwable

class DiscussionApiService(wsClient: WSClient, config: conf.IdentityConfiguration)(implicit executionContext: ExecutionContext) extends SafeLogging {

  private def GET(urlPath: String): Future[WSResponse] = {
    wsClient
      .url(config.discussionApiUrl + urlPath)
      .withRequestTimeout(3.seconds)
      .get()
  }

  private def handleApiResponse(response: WSResponse, userId: String): EitherT[Future, DiscussionApiServiceException, JsValue] = {
    response.status match {
      case 200 => EitherT.rightT(response.json)
      case 404 => EitherT.leftT(DiscussionApiServiceException(s"${response.status}: User ${userId} not found in Discussion"))
      case _ => EitherT.leftT(DiscussionApiServiceException(s"${response.status}: ${response.statusText}"))
    }
  }

  def userHasPublicProfile(userId: String): EitherT[Future, DiscussionApiServiceException, Boolean] = {
    val apiPath = s"/profile/${userId}/stats"

    for {
      response <- GET(apiPath).attemptT.leftMap(error => DiscussionApiServiceException(s"Request to Discussion Api GET ${apiPath} failed: $error"))
      foundUser <- handleApiResponse(response, userId)
      profileStats <- EitherT.fromEither[Future](foundUser.validate[ProfileStats].asEither).leftMap(_ =>
        DiscussionApiServiceException(s"Error validating user profile stats response for user $userId"))
    } yield {
      profileStats.hasComments
    }

  }
}
