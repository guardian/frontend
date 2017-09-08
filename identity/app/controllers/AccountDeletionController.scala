package controllers

import common.ExecutionContexts
import model.{ApplicationContext, IdentityPage, NoCache}
import play.api.mvc._
import services._
import utils.SafeLogging
import form.Mappings
import idapiclient.{EmailPassword, IdApiClient, IdDispatchAsyncHttpClient}
import play.filters.csrf.{CSRFAddToken, CSRFCheck}
import actions.AuthenticatedActions
import conf.IdentityConfiguration
import play.api.data.validation.Constraints
import play.api.data.Form
import play.api.data.Forms._
import play.api.i18n.I18nSupport
import play.api.libs.crypto.CryptoConfig
import play.api.i18n.MessagesApi
import scala.concurrent.Future

class AccountDeletionController(
    idApiClient: IdApiClient,
    authenticatedActions: AuthenticatedActions,
    authenticationService: AuthenticationService,
    idRequestParser: IdRequestParser,
    idUrlBuilder: IdentityUrlBuilder,
    val messagesApi: MessagesApi,
    csrfCheck: CSRFCheck,
    csrfAddToken: CSRFAddToken,
    val cryptoConfig: CryptoConfig,
    http: IdDispatchAsyncHttpClient,
    signInService : PlaySigninService,
    conf: IdentityConfiguration)(implicit context: ApplicationContext)
  extends Controller
    with ExecutionContexts
    with SafeLogging
    with Mappings
    with implicits.Forms
    with I18nSupport {

  import authenticatedActions._
  import views.html.profile.deletion._

  val page = IdentityPage("/deletion", "Account Deletion")
  val pageConfirm = IdentityPage("/deletion/confirm", "Account Deletion Confirmation")

  val accountDeletionForm = Form(
    tuple(
      "password" -> text.verifying(Constraints.nonEmpty),
      "reason" -> optional(text)
  ))

  def renderAccountDeletionForm = csrfAddToken {
    authActionWithUser.async { implicit request =>
      val form = accountDeletionForm.bindFromFlash.getOrElse(accountDeletionForm)
      Future(NoCache(Ok(views.html.profile.deletion.accountDeletion(page, idRequestParser(request), idUrlBuilder, form, Nil, request.user))))
    }
  }

  def processAccountDeletionForm = csrfCheck {
    authActionWithUser.async { implicit request =>
      val boundForm = accountDeletionForm.bindFromRequest

      boundForm.fold(
        formWithErrors => Future(SeeOther(routes.AccountDeletionController.renderAccountDeletionForm().url).flashing(formWithErrors.toFlash)),
        { case (password, reasonOpt) => deleteAccount(boundForm, EmailPassword(request.user.user.primaryEmailAddress, password, None), idRequestParser(request)) }
      )
    }
  }

  def renderAccountDeletionConfirmation(autoDeletion: Boolean) = Action.async { implicit request =>
    Future(NoCache(Ok(accountDeletionConfirm(pageConfirm, autoDeletion))))
  }

  private def deleteAccount[A](
      boundForm: Form[(String, Option[String])],
      emailPasswdAuth: EmailPassword,
      idRequest: IdentityRequest)(implicit request: AuthenticatedActions.AuthRequest[A]): Future[Result] =
    signInService.getCookies(idApiClient.authBrowser(emailPasswdAuth, idRequest.trackingData), true).flatMap { _ match {
        case Left(_) => Future(SeeOther(routes.AccountDeletionController.renderAccountDeletionForm().url).flashing(boundForm.withError("password", "Password is incorrect").toFlash))
        case Right(_) => executeAccountDeletionStepFunction(boundForm)
      }
    }

  private def executeAccountDeletionStepFunction[A](boundForm: Form[(String, Option[String])])(implicit request: AuthenticatedActions.AuthRequest[A]): Future[Result] =
    idApiClient.executeAccountDeletionStepFunction(request.user.user.id, request.user.user.primaryEmailAddress, boundForm("reason").value, request.user.auth).map { _ match {
        case Left(error) =>
          logger.error(s"Account deletion failed for user ${request.user.user.id}: $error")
          SeeOther(routes.AccountDeletionController.renderAccountDeletionForm().url).flashing(boundForm.withGlobalError(
            "We are experiencing technical difficulties. Your account has not been deleted. Please try again later or contact Userhelp.").toFlash)

        case Right(deletionResult) =>
          logger.info(s"Account deletion succeeded for user ${request.user.user.id}: $deletionResult")
          SeeOther(routes.AccountDeletionController.renderAccountDeletionConfirmation(deletionResult.auto == "true").url)
      }
    }
}

