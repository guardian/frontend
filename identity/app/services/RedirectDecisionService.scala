package services

import com.gu.identity.model.User
import play.api.mvc.{ControllerComponents, RequestHeader}

import scala.concurrent.{ExecutionContext, Future}

abstract case class RedirectAccess(){
  def shouldRedirect(pageId: String):Boolean = true
}
object RedirectAccessEmailPrefs extends RedirectAccess {
  override def shouldRedirect(pageId: String):Boolean = pageId contains "email-prefs"
}

object RedirectAccessAllPages extends RedirectAccess


abstract class RedirectDecision(val url: String, val access: RedirectAccess)

case object RedirectToEmailValidation extends RedirectDecision(
  url = "/verify-email?isRepermissioningRedirect=true",
  access = RedirectAccessEmailPrefs
)

case object RedirectToEmailValidationStrictly extends RedirectDecision(
  url = "/verify-email?isRepermissioningRedirect=true",
  access = RedirectAccessAllPages
)

case object RedirectToConsents extends RedirectDecision(
  url = "/consents",
  access = RedirectAccessEmailPrefs
)

case object RedirectToNewsletterConsents extends RedirectDecision(
  url = "/consents/newsletters",
  access = RedirectAccessEmailPrefs
)

class RedirectDecisionService(
                           newsletterService: NewsletterService,
                           idRequestParser: IdRequestParser,
                           controllerComponents: ControllerComponents
                         ) {

  private implicit lazy val ec: ExecutionContext = controllerComponents.executionContext

  def decideValidateAndConsentRedirect[A](user: User, request: RequestHeader): Future[Option[RedirectDecision]] = {

    def userHasRepermissioned: Boolean =
      user.statusFields.hasRepermissioned.contains(true)

    def userEmailValidated: Boolean =
      user.statusFields.isUserEmailValidated

    (userEmailValidated, userHasRepermissioned) match {
      case (false, false) =>
        Future.successful(Some(RedirectToEmailValidationStrictly))

      case (false, true) =>
        Future.successful(Some(RedirectToEmailValidation))

      case (true, false) =>
        Future.successful(Some(RedirectToConsents))

      case (true, true) =>
        newsletterService.subscriptions(
          user.getId,
          idRequestParser(request).trackingData
        ).map {
          emailFilledForm =>
            if (newsletterService.getV1EmailSubscriptions(emailFilledForm).isEmpty)
              None
            else
              Some(RedirectToNewsletterConsents)
        }
    }
  }

}
