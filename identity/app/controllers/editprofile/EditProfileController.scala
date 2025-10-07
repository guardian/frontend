package controllers.editprofile

import actions.AuthenticatedActions
import controllers.editprofile.tabs.EmailsTab
import form._
import idapiclient.IdApiClient
import model._
import play.api.http.HttpConfiguration
import play.api.mvc._
import play.filters.csrf.{CSRFAddToken, CSRFCheck}
import services.newsletters.NewsletterSignupAgent
import services._

class EditProfileController(
    override val idUrlBuilder: IdentityUrlBuilder,
    override val authenticatedActions: AuthenticatedActions,
    override val identityApiClient: IdApiClient,
    override val idRequestParser: IdRequestParser,
    override val csrfCheck: CSRFCheck,
    override val csrfAddToken: CSRFAddToken,
    override val returnUrlVerifier: ReturnUrlVerifier,
    override val newsletterService: NewsletterService,
    override val signinService: PlaySigninService,
    override val newsletterSignupAgent: NewsletterSignupAgent,
    override implicit val profileFormsMapping: ProfileFormsMapping,
    override implicit val context: ApplicationContext,
    val httpConfiguration: HttpConfiguration,
    val controllerComponents: ControllerComponents,
) extends EditProfileControllerComponents
    with EmailsTab
    with ConsentsJourney
