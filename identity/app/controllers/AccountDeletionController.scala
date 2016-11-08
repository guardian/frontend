package controllers

import actions.AuthenticatedActions
import com.gu.identity.model.GroupMembership
import common.{ExecutionContexts, GuardianConfiguration}
import conf.IdentityConfiguration
import discussion.DiscussionApi
import form.Mappings
import idapiclient.responses.CookiesResponse
import idapiclient.{EmailPassword, IdApiClient, IdDispatchAsyncHttpClient}
import model.{IdentityPage, NoCache}
import play.api.data.validation._
import play.api.data.{Form, Forms}
import play.api.i18n.MessagesApi
import play.api.mvc._
import services._
import utils.SafeLogging

import scala.concurrent.Future
import scalaz.{-\/, EitherT, \/, \/-}
import scalaz.std.scalaFuture._
import net.liftweb.json._
import net.liftweb.json.{parse => liftParse}


case class Membership(tier: String)

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
    discussionApi: DiscussionApi)
  extends Controller with ExecutionContexts with SafeLogging with Mappings with implicits.Forms {

  import authenticatedActions._

  val page = IdentityPage("/delete", "Delete Account", "delete")

  val accountDeletionForm = Form(Forms.single("password" -> Forms.text.verifying(Constraints.nonEmpty)))


  sealed trait UserDeletionCriteria
  case object UserHasCommented extends UserDeletionCriteria
  case object UserHasJobAccount extends UserDeletionCriteria
  case object UserHasSubscription extends UserDeletionCriteria
  case object UserHasMembership extends UserDeletionCriteria
  case object UserAllowedToDeleteAccount extends UserDeletionCriteria

  /**
    * Users can delete account themselves if they
    *   - have never commented, and
    *   - do not have a jobs account
    *   - do not have active subscriptions, and
    *   - do not have active membership, and
    *   - do not have mail subscriptions
    */
  def usersSatisfyDeletionCriteria[A](implicit request: AuthenticatedActions.AuthRequest[A]): Future[Boolean] = {
    logger.info("usersSatisfyDeletionCriteria")
    val noComments: Future[Boolean] = discussionApi.myProfile(request.headers).map { profile =>
        logger.info(s" hello ${profile}")
        profile.privateFields.fold(false)(_.hasCommented)
      }

    val noJobs = Future.successful(
      request.user.user.userGroups.find(_.packageCode == "GRS").fold(true)(_ => false))

    for {
      comm <- noComments
      jobs <- noJobs
      isSubscriber <- identityApiClient.userIsSubscriber(request.user.auth)
      isMember <- identityApiClient.userIsMember(request.user.auth)
    } yield { comm && jobs && !isSubscriber && !isMember }
  }

  def renderAccountDeletionForm = authActionWithUser.async { implicit request =>
    val idRequest = idRequestParser(request)
    val form = accountDeletionForm.bindFromFlash.getOrElse(accountDeletionForm)
    usersSatisfyDeletionCriteria.map{ criteriaSatisfied =>
      if (criteriaSatisfied)
        Ok(views.html.accountDeletion(page, idRequest, idUrlBuilder, form, Nil))
      else
        Forbidden("Cannot Delete")

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
