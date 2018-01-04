package controllers

import actions.AuthenticatedActions
import form._
import idapiclient.IdApiClient
import model._
import play.api.mvc._
import play.filters.csrf.{CSRFAddToken, CSRFCheck}
import services.{IdRequestParser, IdentityUrlBuilder, ReturnUrlVerifier, _}
import play.api.http.HttpConfiguration

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
  with ConsentsController {

  import authenticatedActions._

  /** GET /public/edit */
  def displayPublicProfileForm: Action[AnyContent] = displayForm(PublicEditProfilePage)

  /** GET /account/edit */
  def displayAccountForm: Action[AnyContent] = displayForm(AccountEditProfilePage)

  /** GET /membership/edit */
  def displayMembershipForm: Action[AnyContent] = displayForm(MembershipEditProfilePage)

  /** GET /contribution/recurring/edit */
  def displayRecurringContributionForm: Action[AnyContent] = displayForm(recurringContributionPage)

  /** GET /digitalpack/edit */
  def displayDigitalPackForm: Action[AnyContent] = displayForm(DigiPackEditProfilePage)


  /** POST /public/edit */
  def submitPublicProfileForm(): Action[AnyContent] = submitForm(PublicEditProfilePage)

  /** POST /account/edit */
  def submitAccountForm(): Action[AnyContent] = submitForm(AccountEditProfilePage)

}


