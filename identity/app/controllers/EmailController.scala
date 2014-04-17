package controllers

import com.google.inject.{Inject, Singleton}
import services.{IdentityUrlBuilder, IdRequestParser, ReturnUrlVerifier}
import conf.IdentityConfiguration
import idapiclient.{TrackingData, IdApiClient}
import common.ExecutionContexts
import utils.SafeLogging
import play.api.mvc._
import scala.concurrent.Future
import model.IdentityPage
import play.api.data._
import client.{Auth, Error}
import net.liftweb.json.JsonDSL._
import com.gu.identity.model.Subscriber
import play.filters.csrf._
import scala.util.{Try, Failure, Success}


@Singleton
class EmailController @Inject()(returnUrlVerifier: ReturnUrlVerifier,
                                conf: IdentityConfiguration,
                                api: IdApiClient,
                                idRequestParser: IdRequestParser,
                                idUrlBuilder: IdentityUrlBuilder,
                                authAction: actions.AuthenticatedAction)
  extends Controller with ExecutionContexts with SafeLogging {

  val page = IdentityPage("/email-prefs", "Email preferences", "email-prefs")

  private def isValidHtmlPreference(pref: String): Boolean =  Set("HTML", "Text") contains pref

  val emailPrefsForm = Form(
    Forms.tuple(
      "statusFields.receiveGnmMarketing" -> Forms.boolean,
      "statusFields.receive3rdPartyMarketing" -> Forms.boolean,
      "htmlPreference" -> Forms.text().verifying(pref => isValidHtmlPreference(pref))
    )
  )

  def preferences = CSRFAddToken {
    authAction.async {
      implicit request =>
        val idRequest = idRequestParser(request)
        populateForm(request.user.getId(), request.auth, idRequest.trackingData) map {
          form =>
            checkForm(form)
            val template = views.html.profile.email_prefs(page, idRequest, idUrlBuilder, form)
            if(!template.body.contains("checked"))
              logger.error("Email prefs page not rendered correctly! Form data: " + form.data)
            Ok(template)
        }
    }
  }

  private def checkForm[T](form: Form[T]){
    if(form.hasErrors) logger.error("Email prefs form has errors: " + form.errors)
    val pref = form.data get "htmlPreference"
    if(!pref.exists(isValidHtmlPreference)) logger.error("Email prefs form invalid htmlPreference: " + pref)
  }

  private def populateForm(userId: String, auth: Auth, trackingData: TrackingData): Future[Form[(Boolean, Boolean, String)]] = {
    val futures = api.multiple(
      api.user(userId, auth),
      api.userEmails(userId, trackingData)
    )
    futures onFailure { case t => logger.error("Exception while fetching user and email prefs", t) }
    futures map {
      apiResult =>
        logExceptions {
          apiResult match {
            case Left(errors) =>
              errors.foldLeft(emailPrefsForm) {
                case (form, Error(message, description, _, context)) =>
                  logger.error(s"Error while fetching user and email prefs: $message")
                  form.withError(context.getOrElse(""), description)
              }

            case Right((user, subscriber)) =>
              if (!isValidHtmlPreference(subscriber.htmlPreference)) logger.error(s"Invalid Subscriber htmlPreference: ${subscriber.htmlPreference}")
              emailPrefsForm.fill((user.statusFields.isReceiveGnmMarketing, user.statusFields.isReceive3rdPartyMarketing, subscriber.htmlPreference))
          }
        }
    }
  }

  def savePreferences = CSRFCheck {
    authAction.async {
      implicit request =>
        val idRequest = idRequestParser(request)
        val boundForm = emailPrefsForm.bindFromRequest
        boundForm.fold({
          case (formWithErrors) =>
            logger.trace(s"Error saving user email preference, ${formWithErrors.errors}")
            Future.successful(Ok(views.html.profile.email_prefs(page, idRequest, idUrlBuilder, formWithErrors)))
        }, {
          case (gnmMarketing, thirdPartyMarketing, format) =>
            logger.trace("Updating user email prefs")
            val newStatusFields = ("receiveGnmMarketing" -> gnmMarketing) ~ ("receive3rdPartyMarketing" -> thirdPartyMarketing)
            val subscriber = Subscriber(format, Nil)
            api.multiple(
              api.updateUser(request.user.getId(), request.auth, idRequest.trackingData, "statusFields", newStatusFields),
              api.updateUserEmails(request.user.getId(), subscriber, request.auth, idRequest.trackingData)
            ) map {
              case Left(errors) =>
                logger.warn(s"Error while saving user email prefs: $errors")
                val formWithErrors = errors.foldLeft(boundForm) {
                  case (form, Error(message, description, _, context)) =>
                    form.withError(context.getOrElse(""), description)
                }
                Ok(views.html.profile.email_prefs(page, idRequest, idUrlBuilder, formWithErrors))

              case Right((statusFields, _)) => SeeOther(idUrlBuilder.buildUrl("/email-prefs", idRequest))
            }
        })
    }
  }

  protected def logExceptions[T](f: => T) = {
    Try(f) match {
      case Success(result) => result

      case Failure(t) =>
        logger.error("Exception while fetching user and email prefs", t)
        throw t
    }
  }
}
