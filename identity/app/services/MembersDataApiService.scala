package services

import play.api.libs.ws.{DefaultWSCookie, WSClient, WSCookie, WSResponse}
import play.api.mvc.{Cookie, Cookies}
import play.api.libs.functional.syntax._
import play.api.libs.json._
import utils.SafeLogging
import scala.concurrent.{ExecutionContext, Future}

// Modeled on members-data-api Attributes - ContentAccess
// https://github.com/guardian/members-data-api/blob/master/membership-attribute-service/app/models/Attributes.scala
case class ContentAccess(
  isMember: Boolean,
  isPaidMember: Boolean,
  isRecurringContributor: Boolean,
  hasDigitalPack: Boolean,
  isPaperSubscriber: Boolean,
  isGuardianWeeklySubscriber: Boolean
) {
  def canProceedWithAutoDeletion: Boolean = !(isMember || isPaidMember || isRecurringContributor || hasDigitalPack || isPaperSubscriber || isGuardianWeeklySubscriber)
  def hasSubscription: Boolean = hasDigitalPack || isPaperSubscriber || isGuardianWeeklySubscriber
}

object ContentAccess {
  implicit val jsRead: Reads[ContentAccess] = (
    (JsPath \ "member").read[Boolean] and
      (JsPath \ "paidMember").read[Boolean] and
      (JsPath \ "recurringContributor").read[Boolean] and
      (JsPath \ "digitalPack").read[Boolean] and
      (JsPath \ "paperSubscriber").read[Boolean] and
      (JsPath \ "guardianWeeklySubscriber").read[Boolean]
    ) (ContentAccess.apply _)
}

// TODO trait and network vs parsing errors
case class MdapiServiceException(message: String, userId: String) extends Throwable

class MembersDataApiService(wsClient: WSClient, config: conf.IdentityConfiguration)(implicit executionContext: ExecutionContext) extends SafeLogging {
  private def toWSCookie(c: Cookie): WSCookie = {
    DefaultWSCookie(
      name = c.name,
      value = c.value,
      domain = c.domain,
      path = Option(c.path),
      maxAge = c.maxAge.map[Long](i => i.toLong),
      secure = c.secure,
      httpOnly = c.httpOnly
    )
  }

  def getUserContentAccess(cookies: Cookies): Future[Either[MdapiServiceException, ContentAccess]] = {

    wsClient
      .url(s"${config.membersDataApiUrl}/user-attributes/me")
      .withCookies(cookies.map(toWSCookie).toSeq: _*)
      .get()
      .map { response =>
        response.status match {
          case 200 =>
            (response.json \ "contentAccess").validate[ContentAccess] match {
              case JsSuccess(contentAccess, _) => Right(contentAccess)
              case error => Left(MdapiServiceException(s"Parsing error: $error", "user?id"))
            }
          case _ =>
            val errorMsg = s"Failed to getUserContentAccess: $response"
            logger.error(errorMsg)
            Left(MdapiServiceException(errorMsg, "user?ID")) // get id from cookie
        }
      }
  }
}
