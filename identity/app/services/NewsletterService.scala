package services

import idapiclient.{IdApiClient, TrackingData}
import play.api.data._
import utils.SafeLogging

import scala.concurrent.{ExecutionContext, Future}

/**
  * This is the old EmailController converted *as is* to a service to be consumed by EditProfileController
  */
class NewsletterService(api: IdApiClient)(implicit
    executionContext: ExecutionContext,
) extends SafeLogging {

  import EmailPrefsData._

  def subscriptions(userId: String, trackingData: TrackingData): Future[Form[EmailPrefsData]] =
    api.userEmails(userId, trackingData).map {
      case Right(subscriber) =>
        emailPrefsForm.fill(EmailPrefsData(subscriber.subscriptions.map(_.listId)))

      case Left(idapiErrors) =>
        idapiErrors.foldLeft(emailPrefsForm) { (formWithErrors, idapiError) =>
          formWithErrors.withGlobalError(idapiError.description)
        }
    }

  def getEmailSubscriptions(
      form: Form[EmailPrefsData],
      add: List[String] = List(),
      remove: List[String] = List(),
  ): List[String] = {
    (form.data.filter(_._1.startsWith("currentEmailSubscriptions")).map(_._2).filterNot(remove.toSet) ++ add).toList
  }
}

case class EmailPrefsData(
    currentEmailSubscriptions: List[String],
    addEmailSubscriptions: List[String] = List(),
    removeEmailSubscriptions: List[String] = List(),
)

object EmailPrefsData {
  val emailPrefsForm = Form(
    Forms.mapping(
      "currentEmailSubscriptions" -> Forms.list(Forms.text),
      "addEmailSubscriptions" -> Forms.list(Forms.text),
      "removeEmailSubscriptions" -> Forms.list(Forms.text),
    )(EmailPrefsData.apply)(EmailPrefsData.unapply),
  )
}
