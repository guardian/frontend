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

  private def handleMdapiResponse(response: WSResponse, contentAccessResult: JsResult[ContentAccess]) = {
    if(response.status != 200) {
      val errorMsg = s"Network Error retrieving MDAPI content access: ${response.status} ${response.statusText} - ${response.json}"
      logger.error(errorMsg)
      Left(MdapiServiceException(errorMsg, "user?ID")) // get id from cookie
    } else {
      contentAccessResult.fold(
        error => {
          val errorMsg = s"Parsing Error retrieving MDAPI content access: ${error.toString()}"
          logger.error(errorMsg)
          Left(MdapiServiceException(errorMsg, "user?ID")) // get id from cookie
        },
        contentAccess => Right(contentAccess)
      )
    }
  }

  def getUserContentAccess(cookies: Cookies): Future[Either[MdapiServiceException, ContentAccess]] = {
    val root = config.membersDataApiUrl
    val path = "/user-attributes/me"
    (for {
      response <- wsClient.url(s"$root$path").withCookies(cookies.map(c => toWSCookie(c)).toSeq: _*).get()
      contentAccessResult <- Future((response.json \ "contentAccess").validate[ContentAccess])
    } yield {
      handleMdapiResponse(response, contentAccessResult)
    }) recover {
      case f => Left(MdapiServiceException(s"Failed Future: $f", "user?id"))  // get id from cookie // Appropriate Error Message??
    }
  }
}
