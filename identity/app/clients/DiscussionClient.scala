package clients

import play.api.libs.json.{JsValue, Json, OFormat}
import play.api.libs.ws.{WSClient, WSResponse}
import utils.SafeLogging

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}

// A user will exist in Discussion if they have commented or recommended a comment.
// DAPI does not expose recommendation stats by user, so we rely on number of comments stat.
// A user needs 1 or more comments to have a public profile.
case class DiscussionProfileStats(status: String, comments: Int, pickedComments: Int) {
  def hasComments: Boolean = comments > 0 // Will be zero for users who have recommended but not commented.
}

object DiscussionProfileStats {
  implicit val format: OFormat[DiscussionProfileStats] = Json.format[DiscussionProfileStats]
}

case class Comment(id: Int)

object Comment {
  implicit val format: OFormat[Comment] = Json.format[Comment]
}

case class DiscussionCommentsResponse(status: String, comments: Seq[Comment])

object DiscussionCommentsResponse {
  implicit val format: OFormat[DiscussionCommentsResponse] = Json.format[DiscussionCommentsResponse]
}

case class DiscussionProfileResponse(status: String, userProfile: DiscussionProfile)

object DiscussionProfileResponse {
  implicit val format: OFormat[DiscussionProfileResponse] = Json.format[DiscussionProfileResponse]
}

case class DiscussionProfile(userId: String, displayName: String)

object DiscussionProfile {
  implicit val format: OFormat[DiscussionProfile] = Json.format[DiscussionProfile]
}

case class DiscussionApiServiceException(message: String, cause: Throwable) extends Exception(message, cause)

object DiscussionApiServiceException {
  def apply(message: String): DiscussionApiServiceException = DiscussionApiServiceException(message, null)
}

class DiscussionClient(wsClient: WSClient, config: conf.IdentityConfiguration)(implicit
    executionContext: ExecutionContext,
) extends SafeLogging {

  private def GET(urlPath: String): Future[WSResponse] = {
    wsClient
      .url(config.discussionApiUrl + urlPath)
      .withRequestTimeout(3.seconds)
      .get()
  }

  private def handleApiResponse(response: WSResponse, userId: String): Try[Option[JsValue]] = {
    response.status match {
      case 200 => Success(Some(response.json))
      case 404 => Success(None)
      case _   => Failure(DiscussionApiServiceException(s"${response.status}: ${response.statusText}"))
    }
  }

  def findDiscussionUser(userId: String): Future[Option[DiscussionProfileResponse]] = {
    val apiPath = s"/profile/$userId"

    val discussionUserF = for {
      response <- GET(apiPath)
      foundUser <- Future.fromTry(handleApiResponse(response, userId))
    } yield foundUser.map(_.as[DiscussionProfileResponse])

    discussionUserF.recoverWith {
      case e => Future.failed(new DiscussionApiServiceException(s"findDiscussionUser failure to find $userId", e))
    }
  }

  def findProfileStats(userId: String): Future[Option[DiscussionProfileStats]] = {

    val apiPath = s"/profile/$userId/stats"

    val discussionStatsF = for {
      response <- GET(apiPath)
      foundUser <- Future.fromTry(handleApiResponse(response, userId))
    } yield foundUser.map(_.as[DiscussionProfileStats])

    discussionStatsF.recoverWith {
      case e => Future.failed(new DiscussionApiServiceException(s"findProfileStats failure to find $userId", e))
    }
  }

  /**
    * Check if the user has at least one comment.
    * This method simply requests a single comment, and checks if the response is non-empty.
    * If it is, the user has at least one publicly visible comment, and their profile can be shown.
    */
  def profileHasAtLeastOneComment(userId: String): Future[Boolean] = {

    val apiPath = s"/profile/$userId/comments?page=1&pageSize=1"

    val hasCommentsF = for {
      response <- GET(apiPath)
      userCommentsResponse <- Future.fromTry(handleApiResponse(response, userId))
      parsedCommentsResponse <- Future(userCommentsResponse.map(_.as[DiscussionCommentsResponse]))
    } yield parsedCommentsResponse.exists(_.comments.nonEmpty)

    hasCommentsF.recoverWith {
      case e =>
        Future.failed(new DiscussionApiServiceException(s"profileHasAtLeastOneComment failure to find $userId", e))
    }

  }
}
