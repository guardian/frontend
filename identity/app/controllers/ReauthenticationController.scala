package controllers

import actions.AuthenticatedActions
import common.ImplicitControllerExecutionContext
import form.Mappings
import idapiclient.{EmailPassword, IdApiClient, Response, ScGuU}
import implicits.Forms
import controllers.DiscardingIdentityCookies.discardingCookieForRootDomain
import model.{ApplicationContext, IdentityPage, NoCache}
import play.api.data._
import play.api.data.validation.Constraints
import play.api.http.HttpConfiguration
import play.api.i18n.{Messages, MessagesProvider}
import play.api.mvc._
import services.{IdRequestParser, IdentityUrlBuilder, PlaySigninService, ReturnUrlVerifier}
import utils.SafeLogging
import pages.IdentityHtmlPage
import scala.concurrent.Future

class ReauthenticationController(
    returnUrlVerifier: ReturnUrlVerifier,
    api: IdApiClient,
    idRequestParser: IdRequestParser,
    idUrlBuilder: IdentityUrlBuilder,
    authenticatedActions: AuthenticatedActions,
    signInService : PlaySigninService,
    val controllerComponents: ControllerComponents,
    val httpConfiguration: HttpConfiguration)
    (implicit context: ApplicationContext)
  extends BaseController
  with ImplicitControllerExecutionContext
  with SafeLogging
  with Mappings
  with Forms {

  val page = IdentityPage("/reauthenticate", "Re-authenticate", isFlow = true)

  val form = Form(
    Forms.single(
      "password" -> Forms.text
    )
  )

  val formWithConstraints = Form(
    Forms.single(
      "password" -> Forms.text
        .verifying(Constraints.nonEmpty)
    )
  )

  def signInWithAutoSignInToken(autoSignInToken: String, returnUrl: String): Future[Response[Result]] = { // either list of errors or a result
    val futureCookies = api.verifyAutoSignInToken(autoSignInToken)
    signInService.getCookies(futureCookies, rememberMe = false).map {
      case Right(cookies) =>
        Right(SeeOther(returnUrl)
          .withCookies(cookies: _*)
          .discardingCookies(discardingCookieForRootDomain("GU_SIGNIN_EMAIL")))
      case Left(errors) => Left(errors)
    }
  }

  def renderForm(returnUrl: Option[String]): Action[AnyContent] = authenticatedActions.fullAuthWithIdapiUserAction.async { implicit request =>
    val filledForm = form.bindFromFlash.getOrElse(form.fill(""))
    logger.trace("Rendering reauth form")
    val idRequest = idRequestParser(request)
    val googleId = request.user.socialLinks.find(_.network == "google").map(_.socialId)
    val renderReauthenticate =
      Future.successful(
        NoCache(
          Ok(
            IdentityHtmlPage.html(
              content = views.html.reauthenticate(idRequest, idUrlBuilder, filledForm, googleId)
            )(page, request, context)
          ))
      )

    val autoSignIn = for {
      autoSignInToken <- request.getQueryString("autoSignInToken")
      returnUrl <- returnUrl
    } yield {
      signInWithAutoSignInToken(autoSignInToken, returnUrl).flatMap {
        case Left(errors) =>
          logger.error(s"unable to sign in with auto signin token, $errors")
          renderReauthenticate
        case Right(result) => Future.successful(result)
      }
    }

    autoSignIn.getOrElse(renderReauthenticate)
  }

  def processForm: Action[AnyContent] = authenticatedActions.fullAuthWithIdapiUserAction.async { implicit request =>
    val idRequest = idRequestParser(request)
    val boundForm = formWithConstraints.bindFromRequest
    val verifiedReturnUrlAsOpt = returnUrlVerifier.getVerifiedReturnUrl(request)

    def onError(formWithErrors: Form[String]): Future[Result] = {
      logger.info("Invalid reauthentication form submission")
      Future.successful {
        redirectToSigninPage(formWithErrors, verifiedReturnUrlAsOpt)
      }
    }

    def onSuccess(password: String): Future[Result] = {
        logger.trace("reauthenticating with ID API")
        val persistent = request.user.auth match {
          case ScGuU(_, v) => v.isPersistent
          case _ => false
        }
        val auth = EmailPassword(request.user.primaryEmailAddress, password, idRequest.clientIp)
        val authResponse = api.authBrowser(auth, idRequest.trackingData, Some(persistent))

        signInService.getCookies(authResponse, persistent) map {
          case Left(errors) =>
            logger.info(s"Reauthentication failed for user, ${errors.toString()}")
            val formWithErrors = errors.foldLeft(boundForm) { (formFold, error) =>
              val errorMessage =
                if ("Invalid email or password" == error.message) Messages("error.login")
                else error.description
              formFold.withError(error.context.getOrElse(""), errorMessage)
            }

            redirectToSigninPage(formWithErrors, verifiedReturnUrlAsOpt)

          case Right(responseCookies) =>
            logger.trace("Logging user in")
            SeeOther(verifiedReturnUrlAsOpt.getOrElse(returnUrlVerifier.defaultReturnUrl))
              .withCookies(responseCookies:_*)
        }
    }

    boundForm.fold[Future[Result]](onError, onSuccess)
  }

  def redirectToSigninPage(formWithErrors: Form[String], returnUrl: Option[String])(implicit messagesProvider: MessagesProvider): Result = {
    NoCache(SeeOther(routes.ReauthenticationController.renderForm(returnUrl).url).flashing(clearPassword(formWithErrors).toFlash))
  }

  private def clearPassword(formWithPassword: Form[String]) = {
    val dataWithoutPassword = formWithPassword.data + ("password" -> "")
    formWithPassword.copy(data = dataWithoutPassword)
  }
}
