package controllers.editprofile

import actions.AuthenticatedActions._
import com.gu.identity.model.{Consent, User}
import idapiclient.UserUpdateDTO
import model.{IdentityPage, NoCache}
import pages.IdentityHtmlPage
import play.api.data.Form
import play.api.data.Forms.{nonEmptyText, single}
import play.api.libs.json.Json
import play.api.mvc.{Action, AnyContent, Result}
import services.PlaySigninService
import services.newsletters.NewsletterSignupAgent
import utils.ConsentOrder.userWithOrderedConsents
import utils.ConsentsJourneyType.AnyConsentsJourney

import scala.concurrent.Future

trait ConsentsJourney extends EditProfileControllerComponents {

  import authenticatedActions._

  def signinService: PlaySigninService

  def newsletterSignupAgent: NewsletterSignupAgent

  private def newsletters() = {
    newsletterSignupAgent
      .getNewsletters()
      .left
      .map { error =>
        logger.error(s"ConsentsJourney newsletters not available $error")
        Nil
      }
      .merge
  }

  private def consentCompleteView(
      page: IdentityPage,
      user: User,
      returnUrl: String,
  )(implicit request: AuthRequest[AnyContent]): Future[Result] = {

    newsletterService.subscriptions(request.user.id, idRequestParser(request).trackingData).map { emailFilledForm =>
      Ok(
        IdentityHtmlPage.html(
          views.html.completeConsents(
            idRequestParser(request),
            idUrlBuilder,
            returnUrl,
            user.primaryEmailAddress,
            emailFilledForm,
            newsletterService.getEmailSubscriptions(emailFilledForm),
            newsletters(),
          ),
        )(page, request, context),
      )
    }
  }

  private def consentJourneyView(
      page: IdentityPage,
      journey: AnyConsentsJourney,
      forms: ProfileForms,
      user: User,
      consentHint: Option[String],
  )(implicit request: AuthRequest[AnyContent]): Future[Result] = {

    newsletterService.subscriptions(request.user.id, idRequestParser(request).trackingData).map { emailFilledForm =>
      NoCache(
        Ok(
          IdentityHtmlPage.html(content =
            views.html.consentJourney(
              user,
              forms,
              journey,
              returnUrlVerifier.getVerifiedReturnUrl(request).getOrElse(returnUrlVerifier.defaultReturnUrl),
              idRequestParser(request),
              idUrlBuilder,
              emailFilledForm,
              newsletterService.getEmailSubscriptions(emailFilledForm),
              newsletters(),
              consentHint,
              skin = None,
            ),
          )(page, request, context),
        ),
      )

    }
  }

}
