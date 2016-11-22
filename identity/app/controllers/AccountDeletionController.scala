package controllers

import actions.AuthenticatedActions
import com.exacttarget.fuelsdk.ETSubscriber
import common.ExecutionContexts
import conf.IdentityConfiguration
import discussion.DiscussionApi
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
import scalaz.EitherT
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
    conf: IdentityConfiguration,
    discussionApi: DiscussionApi,
    exactTargetService: ExactTargetService)
  extends Controller with ExecutionContexts with SafeLogging with Mappings with implicits.Forms {

    import authenticatedActions._

    val page = IdentityPage("/delete", "Delete Account", "delete")

    val accountDeletionForm = Form(Forms.single("password" -> Forms.text.verifying(Constraints.nonEmpty)))

    def renderAccountDeletionForm = authActionWithUser.async { implicit request =>
      val idRequest = idRequestParser(request)
      val form = accountDeletionForm.bindFromFlash.getOrElse(accountDeletionForm)

      selectDeletionType.map { _ match {
          case AutoDeletion => Ok(views.html.accountDeletion(page, idRequest, idUrlBuilder, form, Nil))
          case e:ManualDeletion => Ok(views.html.accountDeletionManual(page, idRequest, idUrlBuilder))
        }
      }
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
      case object FailedToRemoveFromAllEmailLists extends AccountDeletionFailures

      def checkUserEnteredCorrectPassword(): EitherT[Future, AccountDeletionFailures, Unit] =
        (for {
          auth <- EitherT.fromEither(identityApiClient.authBrowser(emailPasswdAuth, idRequest.trackingData))
          _ <- EitherT.fromEither(signinService.getCookies(Future.successful(Right(auth)), true))
        } yield ()).leftMap(_ => FailedToEnterCorrectPassword)

      def unauthenticateUser(): EitherT[Future, AccountDeletionFailures, CookiesResponse] =
        EitherT.fromEither(api.unauth(emailPasswdAuth, idRequest.trackingData)).leftMap(_ => FailedToUnauthenticateUser)

      def removeFromAllMalingLists(): EitherT[Future, AccountDeletionFailures, ETSubscriber] =
        EitherT(exactTargetService.unsubscribeFromAllLists(emailPasswdAuth.email)).leftMap(_ => FailedToRemoveFromAllEmailLists)

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

          case FailedToRemoveFromAllEmailLists =>
            logger.error(s"Failed to remove user ${request.user.user.id} from all mailing lists during account deletion.")
            renderFormWithUnableToDeleteAccountError(boundForm)

          case FailedToDeleteAccount =>
            logger.error(s"Failed to delete account for user ${request.user.user.id}")
            renderFormWithUnableToDeleteAccountError(boundForm)
        }

      (for {
        _ <- checkUserEnteredCorrectPassword()
        _ <- unauthenticateUser()
        _ <- removeFromAllMalingLists()
        _ <- deleteAccountProper()
      } yield ()).fold(processFailures, _ => clearCookiesAndDisplaySuccessForm)
    }

    sealed trait DeletionType
    case object AutoDeletion extends DeletionType
    case class ManualDeletion(hasComment: Boolean, hasJob: Boolean, isSubscriber: Boolean, isMember: Boolean) extends DeletionType

    /**
      * Users can delete account themselves if they
      *   - have never commented, and
      *   - do not have a jobs account
      *   - do not have active digipack subscriptions
      *   - do not have active membership, and
      */
    private def selectDeletionType[A](implicit request: AuthenticatedActions.AuthRequest[A]): Future[DeletionType] =
      for {
        hasComment <- discussionApi.myProfile(request.headers).map { _.privateFields.fold(true)(_.hasCommented) } // assume user has commented if cannot read private fields
        hasJob <- Future.successful(request.user.user.userGroups.find(_.packageCode == "GRS").fold(false)(_ => true))
        isSubscriber <- identityApiClient.userIsSubscriber(request.user.auth)
        isMember <- identityApiClient.userIsMember(request.user.auth)
      } yield {
        if (!hasComment && !hasJob && !isSubscriber && !isMember)
          AutoDeletion
        else
          ManualDeletion(hasComment, hasJob, isSubscriber, isMember)
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
