package controllers

import actions.AuthenticatedActions
import common.ExecutionContexts
import conf.IdentityConfiguration
import form.Mappings
import idapiclient.responses.CookiesResponse
import idapiclient.{EmailPassword, IdApiClient}
import model.{IdentityPage, NoCache}
import play.api.data.validation._
import play.api.data.{Form, Forms}
import play.api.i18n.MessagesApi
import play.api.mvc._
import services._
import utils.SafeLogging

import scala.concurrent.Future
import scalaz.{-\/, EitherT}
import scalaz.std.scalaFuture._

class AccountDeletionController(
    api: IdApiClient,
    idRequestParser: IdRequestParser,
    idUrlBuilder: IdentityUrlBuilder,
    authenticationService: AuthenticationService,
    authenticatedActions: AuthenticatedActions,
    val messagesApi: MessagesApi,
    identityApiClient: IdApiClient,
    signinService : PlaySigninService,
    conf: IdentityConfiguration)
  extends Controller with ExecutionContexts with SafeLogging with Mappings with implicits.Forms {

  import authenticatedActions._

  val page = IdentityPage("/account/deletion", "Delete Account", "account/delete")

  val accountDeletionForm = Form(Forms.single("password" -> Forms.text.verifying(Constraints.nonEmpty)))

  def renderAccountDeletionForm = authActionWithUser.async { implicit request =>
    val idRequest = idRequestParser(request)
    val form = accountDeletionForm.bindFromFlash.getOrElse(accountDeletionForm)
    Future(Ok(views.html.accountDeletion(page, idRequest, idUrlBuilder, form, Nil)))
  }

  def processAccountDeletionForm = authActionWithUser.async { implicit request =>
    val idRequest = idRequestParser(request)
    val boundForm = accountDeletionForm.bindFromRequest

    boundForm.fold(
      formWithErrors => Future.successful(SeeOther(routes.AccountDeletionController.renderAccountDeletionForm().url).flashing(formWithErrors.toFlash)),
      password => deleteAccount(boundForm, EmailPassword(request.user.user.primaryEmailAddress, password, None), idRequest))
  }

  def renderAccountDeletionConfirmForm = Action.async { implicit request =>
    Future(Ok(views.html.accountDeletionConfirm(page, idRequestParser(request), idUrlBuilder)))
  }

  private def deleteAccount[A](
      boundForm: Form[String],
      emailPasswdAuth: EmailPassword,
      idRequest: IdentityRequest)(implicit request: AuthenticatedActions.AuthRequest[A]) = {

    sealed trait AccountDeletionFailures
    case object FailedToEnterCorrectPassword extends AccountDeletionFailures
    case object FailedToUnauthenticateUser extends AccountDeletionFailures
    case object FailedToDeleteAccount extends AccountDeletionFailures

    def checkUserEnteredCorrectPassword(): EitherT[Future, AccountDeletionFailures, Unit] =
      (for {
        auth <- EitherT.fromEither(identityApiClient.authBrowser(emailPasswdAuth, idRequest.trackingData))
        _ <- EitherT.fromEither(signinService.getCookies(Future.successful(Right(auth)), true))
      } yield ()).leftMap(_ => FailedToEnterCorrectPassword)

    def unauthenticateUser(): EitherT[Future, AccountDeletionFailures, CookiesResponse] =
      EitherT.fromEither(api.unauth(emailPasswdAuth, idRequest.trackingData)).leftMap(_ => FailedToUnauthenticateUser)

    def deleteAccountProper(): EitherT[Future, AccountDeletionFailures, Unit] =
      EitherT.fromEither(identityApiClient.deleteAccount(request.user.auth)).leftMap(_ => FailedToDeleteAccount)

    def clearCookiesAndDisplaySuccessForm() =
      NoCache(SeeOther(routes.AccountDeletionController.renderAccountDeletionConfirmForm().url))
        .discardingCookies(cookiesToDiscard: _*)

    def processFailures(failure: AccountDeletionFailures) = failure match {
        case FailedToEnterCorrectPassword =>
          SeeOther(routes.AccountDeletionController.renderAccountDeletionForm ().url)
            .flashing(boundForm.withError ("password", "Password is incorrect").toFlash)

        case FailedToUnauthenticateUser =>
          logger.error(s"Failed to un-authenticate user ${request.user.user.id} during account deletion.")
          renderFormWithUnableToDeleteAccountError(boundForm)

        case FailedToDeleteAccount =>
          logger.error(s"Failed to delete account for user ${request.user.user.id}")
          renderFormWithUnableToDeleteAccountError(boundForm)
      }

    (for {
      _ <- checkUserEnteredCorrectPassword()
      _ <- unauthenticateUser()
      _ <- deleteAccountProper()
    } yield ()).fold(processFailures, _ => clearCookiesAndDisplaySuccessForm)
  }

  private def renderFormWithUnableToDeleteAccountError(boundForm: Form[String]) =
    SeeOther(routes.AccountDeletionController.renderAccountDeletionForm ().url)
      .flashing(boundForm.withGlobalError(
        "We are experiencing technical difficulties. Your account has not been deleted. Please try again later or contact Userhelp.").toFlash)

  private val cookiesToDiscard = List(
    DiscardingCookie("GU_U", "/", Some(conf.id.domain), secure = false),
    DiscardingCookie("SC_GU_U", "/", Some(conf.id.domain), secure = true),
    DiscardingCookie("GU_ID_CSRF", "/", Some(conf.id.domain), secure = true),
    DiscardingCookie("gu_user_features_expiry", "/", Some(conf.id.domain), secure = false),
    DiscardingCookie("gu_paying_member", "/", Some(conf.id.domain), secure = false))
}
