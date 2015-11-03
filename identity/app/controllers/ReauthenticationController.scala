package controllers

import actions.AuthenticatedActions
import com.google.inject.{Inject, Singleton}
import common.ExecutionContexts
import form.Mappings
import idapiclient.{ScGuU, EmailPassword, IdApiClient}
import implicits.Forms
import model.{IdentityPage, NoCache}
import play.api.data._
import play.api.data.validation.Constraints
import play.api.i18n.{MessagesApi, Messages}
import play.api.mvc._
import services.{IdRequestParser, IdentityUrlBuilder, PlaySigninService, ReturnUrlVerifier}
import utils.SafeLogging

import scala.concurrent.Future


@Singleton
class ReauthenticationController @Inject()(returnUrlVerifier: ReturnUrlVerifier,
                                 api: IdApiClient,
                                 idRequestParser: IdRequestParser,
                                 idUrlBuilder: IdentityUrlBuilder,
                                 authenticatedActions: AuthenticatedActions,
                                 signInService : PlaySigninService,
                                 val messagesApi: MessagesApi)
  extends Controller with ExecutionContexts with SafeLogging with Mappings with Forms {

  val page = IdentityPage("/reauthenticate", "Re-authenticate", "reauthenticate")

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

  def renderForm(returnUrl: Option[String]) = authenticatedActions.authActionWithUser { implicit request =>
    val filledForm = form.bindFromFlash.getOrElse(form.fill(""))

    logger.trace("Rendering reauth form")
    val idRequest = idRequestParser(request)

    NoCache(Ok(views.html.reauthenticate(page, idRequest, idUrlBuilder, filledForm, Option(request.user.primaryEmailAddress))))
  }

  def processForm = authenticatedActions.authActionWithUser.async { implicit request =>
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
            logger.error(errors.toString())
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

  def redirectToSigninPage(formWithErrors: Form[String], returnUrl: Option[String]): Result = {
    NoCache(SeeOther(routes.ReauthenticationController.renderForm(returnUrl).url).flashing(clearPassword(formWithErrors).toFlash))
  }

  private def clearPassword(formWithPassword: Form[String]) = {
    val dataWithoutPassword = formWithPassword.data + ("password" -> "")
    formWithPassword.copy(data = dataWithoutPassword)
  }
}
