package controllers

import actions.AuthenticatedActions
import com.google.inject.{Inject, Singleton}
import services.{IdentityRequest, IdentityUrlBuilder, IdRequestParser, ReturnUrlVerifier}
import conf.IdentityConfiguration
import idapiclient.IdApiClient
import common.ExecutionContexts
import utils.SafeLogging
import play.api.mvc._
import scala.concurrent.Future
import model.{EmailSubscriptions, IdentityPage}
import play.api.data._
import client.{Error}
import net.liftweb.json.JsonDSL._
import com.gu.identity.model.{EmailList, Subscriber}
import play.filters.csrf._
import play.api.i18n.{MessagesApi, I18nSupport}

@Singleton
class EmailController @Inject()(returnUrlVerifier: ReturnUrlVerifier,
                                conf: IdentityConfiguration,
                                api: IdApiClient,
                                idRequestParser: IdRequestParser,
                                idUrlBuilder: IdentityUrlBuilder,
                                authenticatedActions: AuthenticatedActions,
                                val messagesApi: MessagesApi)
  extends Controller with ExecutionContexts with SafeLogging with I18nSupport {
  import EmailPrefsData._
  import authenticatedActions.authAction

  val page = IdentityPage("/email-prefs", "Email preferences", "email-prefs")
  protected def formActionUrl(idUrlBuilder: IdentityUrlBuilder, idRequest: IdentityRequest): String = idUrlBuilder.buildUrl("/email-prefs", idRequest)

  def preferences = CSRFAddToken {
    authAction.async { implicit request =>
      val idRequest = idRequestParser(request)
      val userId = request.user.getId()
      val userFuture = api.user(userId, request.user.auth)
      val subscriberFuture = api.userEmails(userId, idRequest.trackingData)

      (for {
        user <- userFuture
        subscriber <- subscriberFuture
      } yield {
        (user, subscriber) match {
          case (Right(user), Right(subscriber)) => {
            val form = emailPrefsForm.fill(EmailPrefsData(
              user.statusFields.isReceiveGnmMarketing,
              user.statusFields.isReceive3rdPartyMarketing,
              subscriber.htmlPreference,
              subscriber.subscriptions.map(_.listId)
            ))
            form
          }

          case (user, subscriber) => {
            val errors = user.left.getOrElse(Nil) ++ subscriber.left.getOrElse(Nil)
            val formWithErrors = errors.foldLeft(emailPrefsForm) {
              case (formWithErrors, Error(message, description, _, context)) =>
                formWithErrors.withGlobalError(description)
            }
            formWithErrors
          }
        }
      }).map{ form =>
        Ok(views.html.profile.emailPrefs(page, form, formActionUrl(idUrlBuilder, idRequest), getEmailSubscriptions(form)))
      }
    }
  }

  def savePreferences = CSRFCheck {
    authAction.async { implicit request =>

      val idRequest = idRequestParser(request)
      val userId = request.user.getId()
      val auth = request.user.auth
      val trackingParameters = idRequest.trackingData

      emailPrefsForm.bindFromRequest.fold({
        case formWithErrors: Form[EmailPrefsData] =>
          Future.successful((formWithErrors, getEmailSubscriptions(formWithErrors)))
      }, {
        case emailPrefsData: EmailPrefsData =>
          val form = emailPrefsForm.fill(emailPrefsData)
          emailPrefsData.emailSubscription.map {
            case listId if listId.startsWith("unsubscribe-") =>
              val id = listId.replace("unsubscribe-", "")
              api.deleteSubscription(userId, EmailList(id), auth, trackingParameters).map {
                case Right(response) =>
                  (form, getEmailSubscriptions(form, remove = List(id)))

                case Left(response) =>
                  val formWithErrors = response.foldLeft(form) {
                    case (formWithErrors, Error(message, description, _, context)) =>
                      formWithErrors.withError(context.getOrElse(""), description)
                  }
                  (formWithErrors, getEmailSubscriptions(form, remove = List(id)))
              }

            case listId =>
              api.addSubscription(userId, EmailList(listId), auth, trackingParameters).map {
                case Right(response) =>
                  (form, getEmailSubscriptions(form, add = List(listId)))

                case Left(response) =>
                  val formWithErrors = response.foldLeft(form) {
                    case (formWithErrors, Error(message, description, _, context)) =>
                      formWithErrors.withError(context.getOrElse(""), description)
                  }
                  (formWithErrors, getEmailSubscriptions(form, add = List(listId)))
              }
          }.getOrElse {
            val newStatusFields = ("receiveGnmMarketing" -> emailPrefsData.receiveGnmMarketing) ~ ("receive3rdPartyMarketing" -> emailPrefsData.receive3rdPartyMarketing)
            val newSubscriber = Subscriber(emailPrefsData.htmlPreference, Nil)
            val userFuture = api.updateUser(userId, auth, trackingParameters, "statusFields", newStatusFields)
            val subscriberFuture = api.updateUserEmails(userId, newSubscriber, auth, trackingParameters)

            for {
              user <- userFuture
              subscriber <- subscriberFuture
            } yield {
              (user, subscriber) match {
                case (Right(user), Right(subscriber)) => {
                  (form, getEmailSubscriptions(form))
                }

                case (user, subscriber) => {
                  val errors = user.left.getOrElse(Nil) ++ subscriber.left.getOrElse(Nil)
                  val formWithErrors = errors.foldLeft(form) {
                    case (formWithErrors, Error(message, description, _, context)) =>
                      formWithErrors.withError(context.getOrElse(""), description)
                  }
                  (formWithErrors, getEmailSubscriptions(formWithErrors))
                }
              }
            }
          }
      }).map{ case (form, emailSubscriptions) =>
        Ok(views.html.profile.emailPrefs(page, form, formActionUrl(idUrlBuilder, idRequest), emailSubscriptions))
      }
    }
  }

  protected def getEmailSubscriptions(form: Form[EmailPrefsData], add: List[String] = List(), remove: List[String] = List()) =
    EmailSubscriptions(form.data.filter(_._1.startsWith("emailSubscription")).map(_._2).filterNot(remove.toSet) ++ add)
}

case class EmailPrefsData(receiveGnmMarketing: Boolean, receive3rdPartyMarketing: Boolean, htmlPreference: String, emailSubscriptions: List[String], emailSubscription: Option[String] = None)
object EmailPrefsData {
  protected val validPrefs = Set("HTML", "Text")
  def isValidHtmlPreference(pref: String): Boolean =  validPrefs contains pref

  val emailPrefsForm = Form(
    Forms.mapping(
      "statusFields.receiveGnmMarketing" -> Forms.boolean,
      "statusFields.receive3rdPartyMarketing" -> Forms.boolean,
      "htmlPreference" -> Forms.text.verifying(isValidHtmlPreference _),
      "emailSubscription" -> Forms.list(Forms.text),
      "addEmailSubscription" -> Forms.optional(Forms.text)
    )(EmailPrefsData.apply)(EmailPrefsData.unapply)
  )
}
