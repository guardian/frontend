package controllers

import actions.AuthenticatedActions
import services.{IdRequestParser, IdentityRequest, IdentityUrlBuilder, ReturnUrlVerifier}
import conf.IdentityConfiguration
import idapiclient.IdApiClient
import common.ExecutionContexts
import utils.SafeLogging
import play.api.mvc._

import scala.concurrent.Future
import model.{ApplicationContext, EmailNewsletters, IdentityPage}
import play.api.data._
import client.Error
import com.gu.identity.model.{EmailList, Subscriber}
import play.filters.csrf._
import play.api.i18n.{I18nSupport, MessagesApi}
import play.api.libs.json._

class EmailController(
    returnUrlVerifier: ReturnUrlVerifier,
    conf: IdentityConfiguration,
    api: IdApiClient,
    idRequestParser: IdRequestParser,
    idUrlBuilder: IdentityUrlBuilder,
    authenticatedActions: AuthenticatedActions,
    val messagesApi: MessagesApi,
    csrfCheck: CSRFCheck,
    csrfAddToken: CSRFAddToken)(implicit context: ApplicationContext)
    extends Controller with ExecutionContexts with SafeLogging with I18nSupport {

  import EmailPrefsData._
  import authenticatedActions.authAction

  val page = IdentityPage("/email-prefs", "Email preferences")

  def preferences: Action[AnyContent] = csrfAddToken {
    authAction.async { implicit request =>
      val idRequest = idRequestParser(request)
      val userId = request.user.getId()
      val subscriberFuture = api.userEmails(userId, idRequest.trackingData)

      (for {
        subscriber <- subscriberFuture
      } yield {
        subscriber match {
          case Right(s) => {
            val form = emailPrefsForm.fill(EmailPrefsData(
              s.htmlPreference,
              s.subscriptions.map(_.listId)
            ))
            form
          }

          case s => {
            val errors = s.left.getOrElse(Nil)
            val formWithErrors = errors.foldLeft(emailPrefsForm) {
              case (formWithErrors, Error(message, description, _, context)) =>
                formWithErrors.withGlobalError(description)
            }
            formWithErrors
          }
        }
      }).map{ form =>
        Ok(views.html.profile.emailPrefs(
            page,
            form,
            getEmailSubscriptions(form).toList, EmailNewsletters.all,
            idRequest,
            idUrlBuilder
          )
        )
      }
    }
  }

  def savePreferences: Action[AnyContent] = csrfCheck {
    authAction.async { implicit request =>

      val idRequest = idRequestParser(request)
      val userId = request.user.getId()
      val auth = request.user.auth
      val trackingParameters = idRequest.trackingData

      emailPrefsForm.bindFromRequest.fold({
        case formWithErrors: Form[EmailPrefsData] =>
          Future.successful(formWithErrors)
      }, {
        case emailPrefsData: EmailPrefsData =>
          val form = emailPrefsForm.fill(emailPrefsData)

          val unsubscribeResponse = emailPrefsData.removeEmailSubscriptions.map { id =>
            api.deleteSubscription(userId, EmailList(id), auth, trackingParameters)
          }

          val subscribeResponse = emailPrefsData.addEmailSubscriptions.map { id =>
            api.addSubscription(userId, EmailList(id), auth, trackingParameters)
          }

          val newSubscriber = Subscriber(emailPrefsData.htmlPreference, Nil)
          val updatePreferencesResponse = api.updateUserEmails(userId, newSubscriber, auth, trackingParameters)

          Future.sequence(updatePreferencesResponse :: unsubscribeResponse ++ subscribeResponse).map { responses =>
            if (responses.exists(_.isLeft)) {
              form.withGlobalError("There was an error saving your preferences")
            } else {
              form
            }
          }
      }).map { form  =>
        if (form.hasErrors) {
          val errorsAsJson = Json.toJson(
            form.errors.groupBy(_.key).map { case (key, errors) =>
              val nonEmptyKey = if (key.isEmpty) "global" else key
              (nonEmptyKey, errors.map(e => play.api.i18n.Messages(e.message, e.args: _*)))
            }
          )
          Forbidden(errorsAsJson)
        } else {
          Ok("updated")
        }
      }
    }
  }

  protected def getEmailSubscriptions(form: Form[EmailPrefsData], add: List[String] = List(), remove: List[String] = List()) =
    form.data.filter(_._1.startsWith("currentEmailSubscriptions")).map(_._2).filterNot(remove.toSet) ++ add
}

case class EmailPrefsData(
  htmlPreference: String,
  currentEmailSubscriptions: List[String],
  addEmailSubscriptions: List[String] = List(),
  removeEmailSubscriptions: List[String] = List()
)

object EmailPrefsData {
  protected val validPrefs = Set("HTML", "Text")
  def isValidHtmlPreference(pref: String): Boolean =  validPrefs contains pref

  val emailPrefsForm = Form(
    Forms.mapping(
      "htmlPreference" -> Forms.text.verifying(isValidHtmlPreference _),
      "currentEmailSubscriptions" -> Forms.list(Forms.text),
      "addEmailSubscriptions" -> Forms.list(Forms.text),
      "removeEmailSubscriptions" -> Forms.list(Forms.text)
    )(EmailPrefsData.apply)(EmailPrefsData.unapply)
  )
}
