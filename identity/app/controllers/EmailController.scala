package controllers

import com.google.inject.{Inject, Singleton}
import services.{IdentityUrlBuilder, IdRequestParser, ReturnUrlVerifier}
import conf.IdentityConfiguration
import idapiclient.IdApiClient
import common.ExecutionContexts
import utils.SafeLogging
import play.api.mvc._
import scala.concurrent.Future
import model.IdentityPage
import play.api.data._
import client.Error


@Singleton
class EmailController @Inject()(returnUrlVerifier: ReturnUrlVerifier,
                                conf: IdentityConfiguration,
                                api: IdApiClient,
                                idRequestParser : IdRequestParser,
                                idUrlBuilder : IdentityUrlBuilder,
                                authAction: utils.AuthAction)
  extends Controller with ExecutionContexts with SafeLogging {

  val page = IdentityPage("/email-prefs", "Email preferences", "email-prefs")

  val emailPrefsForm = Form(
    Forms.tuple(
      "receive_gnm_marketing" -> Forms.boolean,
      "receive_third_party_marketing" -> Forms.boolean,
      "email_format" -> Forms.text().verifying(List("HTML", "Text").contains(_))
    )
  )

  def preferences = authAction.async { implicit request =>
    val idRequest = idRequestParser(request)
    api.multiple(
      api.user(request.user.getId(), request.auth),
      api.userEmails(request.user, idRequest.trackingData)
    ) map {
      case Right((user, subscriber)) => {
        val filledForm = emailPrefsForm.fill(user.statusFields.isReceiveGnmMarketing, user.statusFields.isReceive3rdPartyMarketing, subscriber.htmlPreference)
        Ok(views.html.email_prefs(page, idRequest, idUrlBuilder, filledForm))
      }
      case Left(errors) => {
        val formWithErrors = errors.foldLeft(emailPrefsForm) { case (form, Error(message, description, _, context)) =>
          logger.info(s"Error while fetching user and email prefs: $message")
          form.withError(context.getOrElse(""), description)
        }
        Ok(views.html.email_prefs(page, idRequest, idUrlBuilder, formWithErrors))
      }
    }
  }

  def savePreferences = authAction.async { implicit request =>
    val idRequest = idRequestParser(request)
    val boundForm = emailPrefsForm.bindFromRequest
    boundForm.fold({
      case (formWithErrors) => Ok(views.html.email_prefs(page, idRequest, idUrlBuilder, formWithErrors))
    }, {
      case (gnmMarketing, thirdPartyMarketing, format) => {
        // save subscriber and user

      }
    })
    Future.successful(Ok(""))
  }
}
