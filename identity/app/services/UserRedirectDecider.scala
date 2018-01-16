package services

import actions.AuthenticatedActions.AuthRequest
import com.gu.identity.model.User
import conf.switches.Switches.{IdentityAllowAccessToGdprJourneyPageSwitch, IdentityPointToConsentJourneyPage}
import idapiclient.IdApiClient
import play.api.mvc.Security.AuthenticatedRequest
import play.api.mvc.ControllerComponents
import services._
import utils.Logging
import scala.concurrent.{ExecutionContext, Future}


class UserRedirectDecider(
  newsletterService: NewsletterService,
  idRequestParser: IdRequestParser,
  controllerComponents: ControllerComponents
) {

  private implicit lazy val ec: ExecutionContext = controllerComponents.executionContext

  sealed abstract class Decision(val url: String)

  case object RedirectToEmailValidation extends Decision(
    url = "/verify-email?isRepermissioningRedirect=true"
  )
  case object RedirectToConsents extends Decision(
    url = "/consents"
  )
  case object RedirectToNewsletterConsents extends Decision(
    url = "/consents/newsletters"
  )

  def decide[A](request: AuthRequest[A]): Future[Option[Decision]] = {

    def userHasRepermissioned: Boolean =
      request.user.statusFields.hasRepermissioned.contains(true)

    def userEmailValidated: Boolean =
      request.user.statusFields.isUserEmailValidated

    (userEmailValidated, userHasRepermissioned) match {
      case (false, false) =>
        Future.successful(Some(RedirectToEmailValidation))

      case (false, true) =>
        Future.successful(None)

      case (true, false) =>
        Future.successful(Some(RedirectToConsents))

      case (true, true) =>
        newsletterService.subscriptions(
          request.user.getId,
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
