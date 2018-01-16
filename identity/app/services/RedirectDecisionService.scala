package services

import actions.AuthenticatedActions.AuthRequest
import play.api.mvc.Security.AuthenticatedRequest
import com.gu.identity.model.User
import conf.switches.Switches.{IdentityAllowAccessToGdprJourneyPageSwitch, IdentityPointToConsentJourneyPage}
import idapiclient.IdApiClient
import play.api.mvc.Security.AuthenticatedRequest
import play.api.mvc.{ControllerComponents, RequestHeader}
import services._
import utils.Logging

import scala.concurrent.{ExecutionContext, Future}


abstract class RedirectDecision(val url: String)

case object RedirectToEmailValidation extends RedirectDecision(
  url = "/verify-email?isRepermissioningRedirect=true"
)

case object RedirectToConsents extends RedirectDecision(
  url = "/consents"
)

case object RedirectToNewsletterConsents extends RedirectDecision(
  url = "/consents/newsletters"
)

class RedirectDecisionService(
                           newsletterService: NewsletterService,
                           idRequestParser: IdRequestParser,
                           controllerComponents: ControllerComponents
                         ) {

  private implicit lazy val ec: ExecutionContext = controllerComponents.executionContext

  def decide[A](user: User, request: RequestHeader): Future[Option[RedirectDecision]] = {

    def userHasRepermissioned: Boolean =
      user.statusFields.hasRepermissioned.contains(true)

    def userEmailValidated: Boolean =
      user.statusFields.isUserEmailValidated

    (userEmailValidated, userHasRepermissioned) match {
      case (false, false) =>
        Future.successful(Some(RedirectToEmailValidation))

      case (false, true) =>
        Future.successful(None)

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
