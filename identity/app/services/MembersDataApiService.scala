package services

import play.api.libs.ws.{DefaultWSCookie, WSClient, WSCookie}
import play.api.mvc.{Cookie, Cookies}
import play.api.libs.json._
import utils.SafeLogging
import scala.concurrent.{ExecutionContext, Future}

// Modeled on members-data-api Attributes - ContentAccess
// https://github.com/guardian/members-data-api/blob/master/membership-attribute-service/app/models/Attributes.scala
case class ContentAccess(
    member: Boolean,
    paidMember: Boolean,
    recurringContributor: Boolean,
    digitalPack: Boolean,
    paperSubscriber: Boolean,
    guardianWeeklySubscriber: Boolean,
) {

  // If any content access values are TRUE, then user cannot proceed with an automatic account deletion and will be blocked
  def canProceedWithAutoDeletion: Boolean =
    !(member || paidMember || recurringContributor || digitalPack || paperSubscriber || guardianWeeklySubscriber)
  // Returns true if user has any one subscription or more
  def hasSubscription: Boolean = digitalPack || paperSubscriber || guardianWeeklySubscriber
}

object ContentAccess {
  implicit val format: Format[ContentAccess] = Json.format[ContentAccess]
}

case class MdapiServiceException(message: String) extends Throwable

class MembersDataApiService(wsClient: WSClient, config: conf.IdentityConfiguration)(implicit
    executionContext: ExecutionContext,
) extends SafeLogging {
  private def toWSCookie(c: Cookie): WSCookie = {
    DefaultWSCookie(
      name = c.name,
      value = c.value,
      domain = c.domain,
      path = Option(c.path),
      maxAge = c.maxAge.map[Long](i => i.toLong),
      secure = c.secure,
      httpOnly = c.httpOnly,
    )
  }

  def getUserContentAccess(cookies: Cookies): Future[Either[MdapiServiceException, ContentAccess]] = {
    wsClient
      .url(s"${config.membersDataApiUrl}/user-attributes/me")
      .withCookies(cookies.map(c => toWSCookie(c)).toSeq: _*)
      .get()
      .map { response =>
        response.status match {
          case 200 =>
            (response.json \ "contentAccess").validate[ContentAccess] match {
              case JsSuccess(contentAccess, _) => Right(contentAccess)
              case error                       =>
                val errorMsg = s"Failed to parse MDAPI response: $error"
                logger.error(errorMsg)
                Left(MdapiServiceException(errorMsg))
            }
          case _ =>
            val errorMsg = s"Failed to getUserContentAccess: $response"
            logger.error(errorMsg)
            Left(MdapiServiceException(errorMsg))
        }
      }
  }
}
