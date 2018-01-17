package services

import com.gu.identity.model.User
import play.api.mvc.{ControllerComponents, RequestHeader}

import scala.concurrent.{ExecutionContext, Future}

sealed abstract class RedirectAccess {
  def isAllowedFrom(url: String): Boolean = false
}

case object RedirectAccessEmailPrefs extends RedirectAccess {
  override def isAllowedFrom(url: String): Boolean = url contains "email-prefs"
}

case object RedirectAccessAllPages extends RedirectAccess {
  override def isAllowedFrom(url: String): Boolean = true
}

case object RedirectAccessNone extends RedirectAccess {
  override def isAllowedFrom(url: String): Boolean = false
}

sealed abstract class ProfileRedirect(
    val url: String,
    val redirectAccess: RedirectAccess = RedirectAccessAllPages) {

  def isAllowedFrom(url: String): Boolean = redirectAccess.isAllowedFrom(url)
}

case object RedirectToEmailValidationFromEmailPrefs extends ProfileRedirect(
  "/verify-email?isRepermissioningRedirect=true",
  RedirectAccessEmailPrefs
)

case object RedirectToEmailValidationFromAnywhere extends ProfileRedirect(
  "/verify-email?isRepermissioningRedirect=true",
  RedirectAccessAllPages
)

case object RedirectToConsentsFromEmailPrefs extends ProfileRedirect(
  "/consents",
  RedirectAccessEmailPrefs
)

case object RedirectToNewsletterConsentsFromEmailPrefs extends ProfileRedirect(
  "/consents/newsletters",
  RedirectAccessEmailPrefs
)

case object NoRedirect extends ProfileRedirect(
  "",
  RedirectAccessNone
)

/**
  * Where users should be redirected to depends on two factors:
  *   1. has user validated the email address
  *   2. has user re-permissioned before
  */
class ProfileRedirectService(
     newsletterService: NewsletterService,
     idRequestParser: IdRequestParser,
     controllerComponents: ControllerComponents) {

  private implicit lazy val ec: ExecutionContext = controllerComponents.executionContext

  def toProfileRedirect[A](user: User, request: RequestHeader): Future[ProfileRedirect] = {

    def userHasRepermissioned: Boolean = user.statusFields.hasRepermissioned.contains(true)
    def userEmailValidated: Boolean = user.statusFields.isUserEmailValidated

    (userEmailValidated, userHasRepermissioned) match {
      case (false, false) =>
        Future.successful(RedirectToEmailValidationFromAnywhere)

      case (false, true) =>
        Future.successful(RedirectToEmailValidationFromEmailPrefs)

      case (true, false) =>
        Future.successful(RedirectToConsentsFromEmailPrefs)

      case (true, true) =>
        newsletterService.subscriptions(
          user.getId,
          idRequestParser(request).trackingData
        ).map {
          emailFilledForm =>
            if (newsletterService.getV1EmailSubscriptions(emailFilledForm).isEmpty)
              NoRedirect
            else
              RedirectToNewsletterConsentsFromEmailPrefs
        }
    }
  }

}
