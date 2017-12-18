package services

import actions.AuthenticatedActions
import actions.AuthenticatedActions.AuthRequest
import com.gu.identity.model.{EmailList, EmailNewsletters, Subscriber}
import idapiclient.{IdApiClient, TrackingData}
import idapiclient.responses.Error
import play.api.data._
import play.api.libs.json._
import play.api.mvc._
import utils.SafeLogging

import scala.concurrent.{ExecutionContext, Future}


/**
  * This is the old EmailController converted *as is* to a service to be consumed by EditProfileController
  */
class NewsletterService(
  api: IdApiClient,
  idRequestParser: IdRequestParser,
  idUrlBuilder: IdentityUrlBuilder)
  (implicit executionContext: ExecutionContext)
  extends SafeLogging {

  import EmailPrefsData._

  def subscriptions(userId: String, trackingData: TrackingData): Future[Form[EmailPrefsData]] =
    api.userEmails(userId, trackingData).map {
      case Right(subscriber) =>
        emailPrefsForm.fill(EmailPrefsData(subscriber.htmlPreference, subscriber.subscriptions.map(_.listId)))

      case Left(idapiErrors) =>
        idapiErrors.foldLeft(emailPrefsForm) {
          (formWithErrors, idapiError) => formWithErrors.withGlobalError(idapiError.description)
        }
    }

  def savePreferences()(implicit request: AuthRequest[AnyContent]): Future[Form[EmailPrefsData]] = {
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
    })
  }

  def getEmailSubscriptions(
     form: Form[EmailPrefsData],
     add: List[String] = List(),
     remove: List[String] = List()): List[String] = {
    (form.data.filter(_._1.startsWith("currentEmailSubscriptions")).map(_._2).filterNot(remove.toSet) ++ add).toList
  }

  def getV1EmailSubscriptions(
      form: Form[EmailPrefsData],
      add: List[String] = List(),
      remove: List[String] = List()): List[String] = {
    //TODO: only return V1 subscriptions when V2 subscriptions are in place
    getEmailSubscriptions(form,add,remove)
  }
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
