package services

import com.gu.identity.model.User
import play.api.mvc.{ControllerComponents, RequestHeader}

import scala.concurrent.{ExecutionContext, Future}

abstract class RedirectAccess {
  private[services] def shouldRedirectOnUrl(pageId: String):Boolean = false
}

case object RedirectAccessEmailPrefs extends RedirectAccess {
  override def shouldRedirectOnUrl(pageId: String):Boolean = pageId contains "email-prefs"
}

case object RedirectAccessAllPages extends RedirectAccess {
  override def shouldRedirectOnUrl(pageId: String):Boolean = true
}


abstract class RedirectDecision(val url: String, protected val redirectAccess: RedirectAccess = RedirectAccessAllPages){
  def shouldRedirectOnUrl(pageId: String):Boolean = redirectAccess.shouldRedirectOnUrl(pageId)
}

case object RedirectToEmailValidation extends RedirectDecision(
  url = "/verify-email?isRepermissioningRedirect=true",
  redirectAccess = RedirectAccessEmailPrefs
)

case object RedirectToEmailValidationStrict extends RedirectDecision(
  url = "/verify-email?isRepermissioningRedirect=true",
  redirectAccess = RedirectAccessAllPages
)

case object RedirectToConsents extends RedirectDecision(
  url = "/consents",
  redirectAccess = RedirectAccessEmailPrefs
)

case object RedirectToNewsletterConsents extends RedirectDecision(
  url = "/consents/newsletters",
  redirectAccess = RedirectAccessEmailPrefs
)

class RedirectDecisionService(
                           newsletterService: NewsletterService,
                           idRequestParser: IdRequestParser,
                           controllerComponents: ControllerComponents
                         ) {

  private implicit lazy val ec: ExecutionContext = controllerComponents.executionContext

  def decideManageAccountRedirect[A](user: User, request: RequestHeader): Future[Option[RedirectDecision]] = {

    def userHasRepermissioned: Boolean =
      user.statusFields.hasRepermissioned.contains(true)

    def userEmailValidated: Boolean =
      user.statusFields.isUserEmailValidated

    (userEmailValidated, userHasRepermissioned) match {
      case (false, false) =>
        Future.successful(Some(RedirectToEmailValidationStrict))

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
