package services

import com.gu.identity.model.User
import play.api.mvc.{ControllerComponents, RequestHeader}

import scala.concurrent.{ExecutionContext, Future}

sealed abstract class RedirectAccess {
  def shouldRedirectOnUrl(pageId: String): Boolean = false
}

case object RedirectAccessEmailPrefs extends RedirectAccess {
  override def shouldRedirectOnUrl(pageId: String): Boolean = pageId contains "email-prefs"
}

case object RedirectAccessAllPages extends RedirectAccess {
  override def shouldRedirectOnUrl(pageId: String): Boolean = true
}

case object RedirectAccessNone extends RedirectAccess {
  override def shouldRedirectOnUrl(pageId: String): Boolean = false
}





sealed abstract class RedirectDecision(
    val url: String,
    val redirectAccess: RedirectAccess = RedirectAccessAllPages) {

  def shouldRedirectOnUrl(pageId: String): Boolean = redirectAccess.shouldRedirectOnUrl(pageId)
}

case object RedirectToEmailValidation extends RedirectDecision(
  "/verify-email?isRepermissioningRedirect=true",
  RedirectAccessEmailPrefs
)

case object RedirectToEmailValidationStrictly extends RedirectDecision(
  "/verify-email?isRepermissioningRedirect=true",
  RedirectAccessAllPages
)

case object RedirectToConsents extends RedirectDecision(
  "/consents",
  RedirectAccessEmailPrefs
)

case object RedirectToNewsletterConsents extends RedirectDecision(
  "/consents/newsletters",
  RedirectAccessEmailPrefs
)

case object NoRedirect extends RedirectDecision(
  "",
  RedirectAccessNone
)

/**
  * Where users should be redirected to depends on two factors:
  *   1. has user validated the email address
  *   2. has user re-permissioned before
  *
  * @param newsletterService
  * @param idRequestParser
  * @param controllerComponents
  */
class RedirectDecisionService(
     newsletterService: NewsletterService,
     idRequestParser: IdRequestParser,
     controllerComponents: ControllerComponents) {

  private implicit lazy val ec: ExecutionContext = controllerComponents.executionContext

  def decideManageAccountRedirect[A](user: User, request: RequestHeader): Future[RedirectDecision] = {

    def userHasRepermissioned: Boolean = user.statusFields.hasRepermissioned.contains(true)
    def userEmailValidated: Boolean = user.statusFields.isUserEmailValidated

    (userEmailValidated, userHasRepermissioned) match {
      case (false, false) =>
        Future.successful(RedirectToEmailValidationStrictly)

      case (false, true) =>
        Future.successful(RedirectToEmailValidation)

      case (true, false) =>
        Future.successful(RedirectToConsents)

      case (true, true) =>
        newsletterService.subscriptions(
          user.getId,
          idRequestParser(request).trackingData
        ).map {
          emailFilledForm =>
            if (newsletterService.getV1EmailSubscriptions(emailFilledForm).isEmpty)
              NoRedirect
            else
              RedirectToNewsletterConsents
        }
    }
  }

}
