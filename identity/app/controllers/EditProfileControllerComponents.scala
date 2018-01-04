package controllers

import actions.AuthenticatedActions
import common.ImplicitControllerExecutionContext
import form.ProfileFormsMapping
import idapiclient.IdApiClient
import model.ApplicationContext
import play.api.i18n.I18nSupport
import play.api.mvc.BaseController
import play.filters.csrf.{CSRFAddToken, CSRFCheck}
import services.{IdRequestParser, IdentityUrlBuilder, NewsletterService, ReturnUrlVerifier}
import utils.SafeLogging

trait EditProfileControllerComponents
    extends BaseController
    with ImplicitControllerExecutionContext
    with SafeLogging
    with I18nSupport
    with implicits.Forms {

  val authenticatedActions: AuthenticatedActions
  val csrfCheck: CSRFCheck
  val csrfAddToken: CSRFAddToken
  val newsletterService: NewsletterService
  val idRequestParser: IdRequestParser
  val returnUrlVerifier: ReturnUrlVerifier
  val idUrlBuilder: IdentityUrlBuilder
  val identityApiClient: IdApiClient
  implicit val context: ApplicationContext
  implicit val profileFormsMapping: ProfileFormsMapping
}
