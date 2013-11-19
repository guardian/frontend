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
import net.liftweb.json.JsonDSL._
import com.gu.identity.model.Subscriber
import play.filters.csrf._


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
      "statusFields.receiveGnmMarketing" -> Forms.boolean,
      "statusFields.receive3rdPartyMarketing" -> Forms.boolean,
      "htmlPreference" -> Forms.text().verifying(List("HTML", "Text").contains(_))
    )
  )

  def preferences = CSRFAddToken {
    authAction.async { implicit request =>
      val idRequest = idRequestParser(request)
      api.multiple(
        api.user(request.user.getId(), request.auth),
        api.userEmails(request.user.getId(), idRequest.trackingData)
      ) map {
        case Left(errors) => {
          val formWithErrors = errors.foldLeft(emailPrefsForm) { case (form, Error(message, description, _, context)) =>
            logger.warn(s"Error while fetching user and email prefs: $message")
            form.withError(context.getOrElse(""), description)
          }
          Ok(views.html.profile.email_prefs(page, idRequest, idUrlBuilder, formWithErrors))
        }
        case Right((user, subscriber)) => {
          val filledForm = emailPrefsForm.fill((user.statusFields.isReceiveGnmMarketing, user.statusFields.isReceive3rdPartyMarketing, subscriber.htmlPreference))
          Ok(views.html.profile.email_prefs(page, idRequest, idUrlBuilder, filledForm))
        }
      }
    }
  }

  def savePreferences = CSRFCheck {
    authAction.async { implicit request =>
      val idRequest = idRequestParser(request)
      val boundForm = emailPrefsForm.bindFromRequest
      boundForm.fold({
        case (formWithErrors) => {
          logger.trace(s"Error saving user email preference, ${formWithErrors.errors}")
          Future.successful(Ok(views.html.profile.email_prefs(page, idRequest, idUrlBuilder, formWithErrors)))
        }
      }, {
        case (gnmMarketing, thirdPartyMarketing, format) => {
          logger.trace("Updating user email prefs")
          val newStatusFields = ("receiveGnmMarketing" -> gnmMarketing) ~ ("receive3rdPartyMarketing" -> thirdPartyMarketing)
          val subscriber = Subscriber(format, Nil)
          api.multiple(
            api.updateUser(request.user.getId(), request.auth, idRequest.trackingData, "statusFields", newStatusFields),
            api.updateUserEmails(request.user.getId(), subscriber, request.auth, idRequest.trackingData)
          ) map {
            case Left(errors) => {
              logger.warn(s"Error while saving user email prefs: ${errors}")
              val formWithErrors = errors.foldLeft(boundForm) { case (form, Error(message, description, _, context)) =>
                form.withError(context.getOrElse(""), description)
              }
              Ok(views.html.profile.email_prefs(page, idRequest, idUrlBuilder, formWithErrors))
            }
            case Right((statusFields, _)) => SeeOther(idUrlBuilder.buildUrl("/email-prefs", idRequest))
          }
        }
      })
    }
  }
}
