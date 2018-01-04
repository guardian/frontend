package controllers.editprofile

import actions.AuthenticatedActions
import form._
import idapiclient.IdApiClient
import model._
import play.api.http.HttpConfiguration
import play.api.mvc._
import play.filters.csrf.{CSRFAddToken, CSRFCheck}
import services.{IdRequestParser, IdentityUrlBuilder, ReturnUrlVerifier, _}

class EditProfileController(
    override val idUrlBuilder: IdentityUrlBuilder,
    override val authenticatedActions: AuthenticatedActions,
    override val identityApiClient: IdApiClient,
    override val idRequestParser: IdRequestParser,
    override val csrfCheck: CSRFCheck,
    override val csrfAddToken: CSRFAddToken,
    override val returnUrlVerifier: ReturnUrlVerifier,
    override implicit val profileFormsMapping: ProfileFormsMapping,
    val controllerComponents: ControllerComponents,
    override val newsletterService: NewsletterService,
    val httpConfiguration: HttpConfiguration,
    override implicit val context: ApplicationContext)

  extends EditProfileControllerComponents
  with EditProfileFormHandling
  with EmailsTab
  with AccountTab
  with PublicTab
  with SupporterTabs


