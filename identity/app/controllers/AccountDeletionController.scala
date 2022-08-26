package controllers

import common.ImplicitControllerExecutionContext
import model.{ApplicationContext, IdentityPage, NoCache}
import play.api.mvc._
import services._
import utils.SafeLogging
import form.Mappings
import idapiclient.{EmailPassword, IdApiClient}
import play.filters.csrf.{CSRFAddToken, CSRFCheck}
import actions.AuthenticatedActions
import conf.IdentityConfiguration
import pages.IdentityHtmlPage
import play.api.data.validation.Constraints
import play.api.data.Form
import play.api.data.Forms._
import play.api.http.HttpConfiguration
import play.api.i18n.I18nSupport
import scala.concurrent.Future

class AccountDeletionController(
    idApiClient: IdApiClient,
    authenticatedActions: AuthenticatedActions,
    authenticationService: AuthenticationService,
    idRequestParser: IdRequestParser,
    idUrlBuilder: IdentityUrlBuilder,
    csrfCheck: CSRFCheck,
    csrfAddToken: CSRFAddToken,
    signInService: PlaySigninService,
    mdapiService: MembersDataApiService,
    conf: IdentityConfiguration,
    val controllerComponents: ControllerComponents,
    val httpConfiguration: HttpConfiguration,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
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
      "reason" -> optional(text),
    ),
  )

  private def handleMdapiServiceResponse[A](
      result: Either[MdapiServiceException, ContentAccess],
  )(implicit request: AuthenticatedActions.AuthRequest[A]): Future[Result] = {
    result match {
      case Right(contentAccess) =>
        if (contentAccess.canProceedWithAutoDeletion) {
          val form = accountDeletionForm.bindFromFlash.getOrElse(accountDeletionForm)
          Future(
            NoCache(
              Ok(
                IdentityHtmlPage.html(
                  views.html.profile.deletion
                    .accountDeletionForm(page, idRequestParser(request), idUrlBuilder, form, Nil, request.user),
                )(page, request, context),
              ),
            ),
          )
        } else {
          Future(
            NoCache(
              Ok(
                IdentityHtmlPage.html(
                  accountDeletionBlock(page, idRequestParser(request), idUrlBuilder, Nil, request.user, contentAccess),
                )(page, request, context),
              ),
            ),
          )
        }
      case Left(_) =>
        Future(
          NoCache(
            Ok(
              IdentityHtmlPage.html(views.html.profile.deletion.error(page))(page, request, context),
            ),
          ),
        )
    }
  }

  def renderAccountDeletionForm: Action[AnyContent] =
    csrfAddToken {
      fullAuthWithIdapiUserAction.async { implicit request =>
        mdapiService.getUserContentAccess(request.cookies) flatMap { response =>
          handleMdapiServiceResponse(response)(request)
        } recoverWith {
          case t: Throwable =>
            logger.error(s"Future failed when calling MDAPI", t)
            Future(NoCache(Ok(IdentityHtmlPage.html(views.html.profile.deletion.error(page))(page, request, context))))
        }
      }
    }

  def processAccountDeletionForm: Action[AnyContent] =
    csrfCheck {
      fullAuthWithIdapiUserAction.async { implicit request =>
        val boundForm = accountDeletionForm.bindFromRequest()

        boundForm.fold(
          formWithErrors =>
            Future(
              SeeOther(routes.AccountDeletionController.renderAccountDeletionForm.url)
                .flashing(formWithErrors.toFlash),
            ),
          {
            case (password, reasonOpt) =>
              deleteAccount(
                boundForm,
                EmailPassword(request.user.user.primaryEmailAddress, password, None),
                idRequestParser(request),
              )
          },
        )
      }
    }

  def renderAccountDeletionConfirmation(autoDeletion: Boolean): Action[AnyContent] =
    Action.async { implicit request =>
      Future(
        NoCache(
          Ok(
            IdentityHtmlPage.html(accountDeletionConfirm(pageConfirm, autoDeletion))(page, request, context),
          ),
        ),
      )
    }

  private def deleteAccount[A](
      boundForm: Form[(String, Option[String])],
      emailPasswdAuth: EmailPassword,
      idRequest: IdentityRequest,
  )(implicit request: AuthenticatedActions.AuthRequest[A]): Future[Result] =
    signInService.getCookies(idApiClient.authBrowser(emailPasswdAuth, idRequest.trackingData), true).flatMap {
      _ match {
        case Left(_) =>
          Future(
            SeeOther(routes.AccountDeletionController.renderAccountDeletionForm.url)
              .flashing(boundForm.withError("password", "Password is incorrect").toFlash),
          )
        case Right(_) => executeAccountDeletionStepFunction(boundForm)
      }
    }

  private def executeAccountDeletionStepFunction[A](
      boundForm: Form[(String, Option[String])],
  )(implicit request: AuthenticatedActions.AuthRequest[A]): Future[Result] =
    idApiClient
      .executeAccountDeletionStepFunction(
        request.user.user.id,
        request.user.user.primaryEmailAddress,
        boundForm("reason").value,
        request.user.auth,
      )
      .map {
        _ match {
          case Left(error) =>
            logger.error(s"Account deletion failed for user ${request.user.user.id}: $error")
            SeeOther(routes.AccountDeletionController.renderAccountDeletionForm.url).flashing(
              boundForm
                .withGlobalError(
                  "We are experiencing technical difficulties. Your account has not been deleted. Please try again later or contact Userhelp.",
                )
                .toFlash,
            )

          case Right(deletionResult) =>
            logger.info(s"Account deletion succeeded for user ${request.user.user.id}: $deletionResult")
            SeeOther(
              routes.AccountDeletionController.renderAccountDeletionConfirmation(deletionResult.auto == "true").url,
            )
        }
      }
}
