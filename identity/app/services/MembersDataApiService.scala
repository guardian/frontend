package services

import common.{HttpStatusException, Logging}
import play.api.libs.ws.{DefaultWSCookie, WSClient, WSCookie}
import play.api.mvc.{Cookie, Cookies}
import play.api.libs.functional.syntax._
import play.api.libs.json._
import scala.concurrent.{ExecutionContext, Future}

// Modeled on members-data-api Attributes - ContentAccess
// https://github.com/guardian/members-data-api/blob/master/membership-attribute-service/app/models/Attributes.scala
case class ContentAccess(
  isMember: Boolean, // TODO a friend membership should not prevent auto-account deletion but currently does
  isPaidMember: Boolean,
  isRecurringContributor: Boolean,
  hasDigitalPack: Boolean,
  isPaperSubscriber: Boolean,
  isGuardianWeeklySubscriber: Boolean
) {
  def canProceedWithAutoDeletion: Boolean = !(isMember || isPaidMember || isRecurringContributor || hasDigitalPack || isPaperSubscriber || isGuardianWeeklySubscriber)
  def hasPaidProducts: Boolean = isPaidMember || isRecurringContributor || hasDigitalPack || isPaperSubscriber || isGuardianWeeklySubscriber
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

class MembersDataApiService(wsClient: WSClient, config: conf.IdentityConfiguration)(implicit executionContext: ExecutionContext) extends Logging {

  // TODO is there an alternative to converting to WSCookie?
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

  def getUserContentAccess(cookies: Cookies): Future[ContentAccess] = {
    val root = config.membersDataApiUrl
    val path = "/user-attributes/me"
    wsClient.url(s"$root$path").withCookies(cookies.map(c => toWSCookie(c)).toSeq: _*).get() flatMap { response =>
      response.status match {
        case 200 =>
          val contentAccess = response.json \ "contentAccess"
          Future.successful(contentAccess.as[ContentAccess])
        case _ => Future.failed(HttpStatusException(response.status, response.statusText))
      }
    }
  }
}
