package controllers.editprofile

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

}
