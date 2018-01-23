package services

/**
  * Abstraction for the redirect behaviour in Profile pages
  * This exists because once you are in any profile page it is possible
  * to switch between them using javascript tabs, bypassing a normal
  * redirection.
  *
  * Both AuthenticatedActions and the ProfileForms template can use
  * this service to make redirects work:
  * a) Normally via play routing
  * b) Replacing the javascript tab links in the template
  */


import com.gu.identity.model.User
import play.api.mvc.{ControllerComponents, RequestHeader}

import scala.concurrent.{ExecutionContext, Future}

sealed abstract class ProfileRedirect(val url: String) {
  def isAllowedFrom(url: String): Boolean
}

case object RedirectToEmailValidationFromAnywhereButAccountDetails extends ProfileRedirect("/verify-email?isRepermissioningRedirect=true") {
  override def isAllowedFrom(url: String): Boolean = !(url contains "account/edit")
}

case object RedirectToConsentsFromEmailPrefs extends ProfileRedirect("/consents") {
  override def isAllowedFrom(url: String): Boolean = url contains "email-prefs"
}

case object RedirectToNewsletterConsentsFromEmailPrefs extends ProfileRedirect("/consents/newsletters") {
  override def isAllowedFrom(url: String): Boolean = url contains "email-prefs"
}

case object NoRedirect extends ProfileRedirect("") {
  override def isAllowedFrom(url: String): Boolean = false
}

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

  def toConsentsRedirect[A](user: User, request: RequestHeader): Future[ProfileRedirect] = {
    user.statusFields.isUserEmailValidated match {
      case true => Future.successful(NoRedirect)
      case false => Future.successful(RedirectToEmailValidationFromAnywhereButAccountDetails)
    }
  }

  def toProfileRedirect[A](user: User, request: RequestHeader): Future[ProfileRedirect] = {

    def userHasRepermissioned: Boolean = user.statusFields.hasRepermissioned.contains(true)
    def userEmailValidated: Boolean = user.statusFields.isUserEmailValidated

    (userEmailValidated, userHasRepermissioned) match {
      case (false, _) =>
        Future.successful(RedirectToEmailValidationFromAnywhereButAccountDetails)

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
