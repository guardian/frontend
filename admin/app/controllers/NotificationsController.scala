package controllers.admin

import java.util

import common.{Logging, ExecutionContexts}
import model.TinyResponse
import model.notifications.DynamoDbStore
import play.api.mvc.{Controller, Action}
import play.api.data.Form
import play.api.data.Forms._

import scala.concurrent
import scala.concurrent.{Future, ExecutionContext}

case class Subscription(contentId: String, registrationId: String)

object NotificationsController extends Controller with ExecutionContexts with Logging {

    val form = Form( mapping(
        "content_id"  -> nonEmptyText,
        "registration_id"  -> nonEmptyText
      )(Subscription.apply)(Subscription.unapply)
    )

    def saveSubscription() = Action.async { implicit request =>
      form.bindFromRequest.fold(
         errors => {
           Future.successful(BadRequest)
         },
         data => {
           DynamoDbStore.addItemToSubcription(data.registrationId, data.contentId)
           Future.successful(Ok)
         }
      )
    }

    def deleteSubscription() = Action.async { implicit request =>
      form.bindFromRequest.fold(
         errors => {
           Future.successful(BadRequest)
         },
         data => {
           DynamoDbStore.deleteItemFromSubcription(data.registrationId, data.contentId)
           Future.successful(Ok)
         }
      )
    }

}
