package controllers

import actions.AuthenticatedActions
import common.ExecutionContexts
import conf.IdentityConfiguration
import discussion.api.DiscussionApi
import form.Mappings
import idapiclient.{EmailPassword, IdApiClient}
import model.{IdentityPage, NoCache, SignoutDiscaringCookies}
import play.api.data.validation._
import play.api.data.{Form, Forms}
import play.api.i18n.MessagesApi
import play.api.mvc._
import play.filters.csrf.{CSRFAddToken, CSRFCheck}
import services._
import utils.SafeLogging
import scala.concurrent.Future

class AccountDeletionController(
    idRequestParser: IdRequestParser,
    idUrlBuilder: IdentityUrlBuilder,
    authenticationService: AuthenticationService,
    authenticatedActions: AuthenticatedActions,
    val messagesApi: MessagesApi,
    idApiClient: IdApiClient,
    signinService : PlaySigninService,
    conf: IdentityConfiguration,
    discussionApi: DiscussionApi)
  extends Controller with ExecutionContexts with SafeLogging with Mappings with implicits.Forms {

    import authenticatedActions._
    import views.html.fragments.profile.deletion._

    val page = IdentityPage("/delete", "Delete Account", Some("delete"))

    val accountDeletionForm = Form(Forms.single("password" -> Forms.text.verifying(Constraints.nonEmpty)))

    def renderAccountDeletionForm = CSRFAddToken {
      authActionWithUser.async { implicit request =>
        val idRequest = idRequestParser(request)
        val form = accountDeletionForm.bindFromFlash.getOrElse(accountDeletionForm)

        autoDeletionCriteriaSatisfied.map { _ match {
            case true => renderAutoDeletionForm(form)
            case false => renderManualDeletionForm
          }
        }
      }
    }

    def processAccountDeletionForm = CSRFCheck { authActionWithUser.async { implicit request =>
        val idRequest = idRequestParser(request)
        val boundForm = accountDeletionForm.bindFromRequest

        boundForm.fold(
          formWithErrors => Future.successful(SeeOther(routes.AccountDeletionController.renderAccountDeletionForm().url).flashing(formWithErrors.toFlash)),
          password => deleteAccount(boundForm, EmailPassword(request.user.user.primaryEmailAddress, password, None), idRequest))
      }
    }

    def renderAccountDeletionConfirmForm = Action.async { implicit request =>
      Future(Ok(accountDeletionConfirm(page, idRequestParser(request), idUrlBuilder)))
    }

  private def deleteAccount[A](boundForm: Form[String], emailPasswdAuth: EmailPassword, idRequest: IdentityRequest)(implicit request: AuthenticatedActions.AuthRequest[A]): Future[Result] =
      signinService.getCookies(idApiClient.authBrowser(emailPasswdAuth, idRequest.trackingData), true).flatMap {_ match {
          case Left(_) => Future(SeeOther(routes.AccountDeletionController.renderAccountDeletionForm().url).flashing(boundForm.withError("password", "Password is incorrect").toFlash))
          case Right(_) => idApiClient.deleteAllSubscriptions(request.user.user.id, request.user.auth, idRequest.trackingData).flatMap {_ match {
              case Left(_) => Future(renderFormWithUnableToDeleteAccountError(boundForm))
              case Right(_) => idApiClient.unauth(emailPasswdAuth, idRequest.trackingData).flatMap {_ match {
                  case Left(_) => Future(renderFormWithUnableToDeleteAccountError(boundForm))
                  case Right(_) => idApiClient.deleteAccount(request.user.auth, emailPasswdAuth).flatMap {_ match {
                      case Left(_) => Future(renderFormWithUnableToDeleteAccountError(boundForm))
                      case Right(_) => Future(renderAutoDeletionConfirm)
                    }
                  }
                }
              }
            }
          }
        }
      }


  private def renderManualDeletionForm[A](implicit request: AuthenticatedActions.AuthRequest[A]) = {
    val idRequest = idRequestParser(request)
    Ok(accountDeletionManual(page, idRequest, idUrlBuilder))
  }

  private def renderAutoDeletionForm[A](form: Form[String])(implicit request: AuthenticatedActions.AuthRequest[A]) = {
    val idRequest = idRequestParser(request)
    NoCache(Ok(accountDeletion(page, idRequest, idUrlBuilder, form, Nil)))
  }

  private def renderAutoDeletionConfirm[A](implicit request: AuthenticatedActions.AuthRequest[A]) =
    NoCache(SeeOther(routes.AccountDeletionController.renderAccountDeletionConfirmForm().url)).discardingCookies(SignoutDiscaringCookies(conf.id.domain): _*)

  private def autoDeletionCriteriaSatisfied[A](implicit request: AuthenticatedActions.AuthRequest[A]): Future[Boolean] =
    for {
      noSavedArticles <- idApiClient.hasNoSavedArticles(request.user.auth)
      noComments <- discussionApi.myProfile(request.headers).map {_.privateFields.fold(false)(profile => !(profile.hasCommented))}
      noJob <- Future.successful(request.user.user.userGroups.find(_.packageCode == "GRS").fold(true)(_ => false))
      notSubscriber <- idApiClient.userIsNotSubscriber(request.user.auth)
      notMember <- idApiClient.userIsNotMember(request.user.auth)
    } yield (noSavedArticles && noComments && noJob && notSubscriber && notMember)


    private def renderFormWithUnableToDeleteAccountError(boundForm: Form[String]) =
      SeeOther(routes.AccountDeletionController.renderAccountDeletionForm ().url)
        .flashing(boundForm.withGlobalError(
          "We are experiencing technical difficulties. Your account has not been deleted. Please try again later or contact Userhelp.").toFlash)
}
