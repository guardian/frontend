package services

import actions.AuthenticatedActions.AuthRequest
import com.gu.identity.model.User
import conf.switches.Switches.{IdentityAllowAccessToGdprJourneyPageSwitch, IdentityPointToConsentJourneyPage}
import idapiclient.IdApiClient
import play.api.mvc.Security.AuthenticatedRequest
import play.api.mvc._
import services._
import utils.Logging
import scala.concurrent.{ExecutionContext, Future}


object UserRedirectDecider {


  sealed trait UserRedirect

  case object RedirectToEmailValidation extends UserRedirect
  case object RedirectToConsents extends UserRedirect
  case object RedirectToNewsletterConsents extends UserRedirect

  def decideUserRedirect[A](
                             request: AuthRequest[A]
                           )(
                             implicit newsletterService: NewsletterService, idRequestParser: IdRequestParser, ec: ExecutionContext
                           ): Future[Option[UserRedirect]] = {

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
