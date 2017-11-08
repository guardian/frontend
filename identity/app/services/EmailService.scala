package services

import actions.AuthenticatedActions
import actions.AuthenticatedActions.AuthRequest
import com.gu.identity.model.{EmailList, Subscriber}
import idapiclient.IdApiClient
import idapiclient.responses.Error
import play.api.data._
import play.api.libs.json._
import play.api.mvc._
import utils.SafeLogging

import scala.concurrent.{ExecutionContext, Future}

class EmailService(
  api: IdApiClient,
  idRequestParser: IdRequestParser,
  idUrlBuilder: IdentityUrlBuilder)
  (implicit executionContext: ExecutionContext)
  extends SafeLogging {

  import EmailPrefsData._

  def preferences()(implicit request: AuthRequest[AnyContent]): Future[Form[EmailPrefsData]] = {
      val idRequest = idRequestParser(request)
      val userId = request.user.getId()
      val subscriberFuture = api.userEmails(userId, idRequest.trackingData)

      for {
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
      }
    }

//  /**
//    * POST JS async
//    *
//    * Should just return 200 OK "updated"
//    */
//  def savePreferences()(implicit request: AuthRequest[AnyContent]): Future[JsValue] = {
//      val idRequest = idRequestParser(request)
//      val userId = request.user.getId()
//      val auth = request.user.auth
//      val trackingParameters = idRequest.trackingData
//
//      emailPrefsForm.bindFromRequest.fold({
//        case formWithErrors: Form[EmailPrefsData] =>
//          Future.successful(formWithErrors)
//      }, {
//        case emailPrefsData: EmailPrefsData =>
//          val form = emailPrefsForm.fill(emailPrefsData)
//
//          val unsubscribeResponse = emailPrefsData.removeEmailSubscriptions.map { id =>
//            api.deleteSubscription(userId, EmailList(id), auth, trackingParameters)
//          }
//
//          val subscribeResponse = emailPrefsData.addEmailSubscriptions.map { id =>
//            api.addSubscription(userId, EmailList(id), auth, trackingParameters)
//          }
//
//          val newSubscriber = Subscriber(emailPrefsData.htmlPreference, Nil)
//          val updatePreferencesResponse = api.updateUserEmails(userId, newSubscriber, auth, trackingParameters)
//
//          Future.sequence(updatePreferencesResponse :: unsubscribeResponse ++ subscribeResponse).map { responses =>
//            if (responses.exists(_.isLeft)) {
//              form.withGlobalError("There was an error saving your preferences")
//            } else {
//              form
//            }
//          }
//      }).map { form  =>
//        if (form.hasErrors) {
////          val errorsAsJson = Json.toJson(
////            form.errors.groupBy(_.key).map { case (key, errors) =>
////              val nonEmptyKey = if (key.isEmpty) "global" else key
////              (nonEmptyKey, errors.map(e => (e.message, e.args: _*)))
////            }
////          )
////          errorsAsJson
//          Json.parse(s"error")
//        } else {
//          Json.parse("updated")
//        }
//      }
//    }



  /**
    * POST JS async
    *
    * Should just return 200 OK "updated"
    */
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
