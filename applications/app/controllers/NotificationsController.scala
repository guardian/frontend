package controllers

import common.{JsonComponent, ExecutionContexts, Logging}
import model.NoCache
import model.notifications.{LatestNotificationsDynamoDbStore, DynamoDbStore}
import play.api.data.Form
import play.api.data.Forms._
import play.api.libs.json.{JsArray, JsObject}
import play.api.mvc.{Action, Controller}


import scala.concurrent.Future

case class Subscription(notificationTopicId: String, gcmBrowserId: String)
case class TestMessage(gcmBrowserId: String, title: String, body: String)


object NotificationsController extends Controller with ExecutionContexts with Logging {

    val form = Form( mapping(
        "notificationTopicId"  -> nonEmptyText,
        "gcmBrowserId"  -> nonEmptyText
      )(Subscription.apply)(Subscription.unapply)
    )

    val newMessageForm = Form( mapping(
        "gcmBrowserId"  -> nonEmptyText,
        "title"  -> nonEmptyText,
        "body"  -> nonEmptyText
      )(TestMessage.apply)(TestMessage.unapply)
    )

    def saveSubscription() = Action.async { implicit request =>
      form.bindFromRequest.fold(
         errors => {
           Future.successful(BadRequest)
         },
         data => {
           DynamoDbStore.addItemToSubcription(data.gcmBrowserId, data.notificationTopicId)
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
           DynamoDbStore.deleteItemFromSubcription(data.gcmBrowserId, data.notificationTopicId)
           Future.successful(Ok)
         }
      )
    }

    def getMessage(gcmBrowserId: String) = Action.async { implicit request =>
        println(s"get: ${gcmBrowserId}")
        LatestNotificationsDynamoDbStore.getLatestMessage(gcmBrowserId).flatMap {
          attributes =>
            attributes.get("messages").map{
              messages =>
                println("wotcha")
                println(messages.toString)
            }
            Future.successful(Ok)
        }
    }

    //Tbis is a personal development tool which under no circumstances should ever make it to production
    def createNewMessage() = Action.async { implicit request =>
      newMessageForm.bindFromRequest.fold(
          errors => { Future.successful(BadRequest)},
          data => {
            LatestNotificationsDynamoDbStore.storeMessage(data.gcmBrowserId, data.title, data.body)
            Future.successful(Ok)
          }
      )
    }

   def getLatestMessage(gcmBrowserId: String) = Action.async { implicit request =>

     LatestNotificationsDynamoDbStore.getLatestMessageAndCheck(gcmBrowserId) map {
       messages =>
         NoCache(
           JsonComponent(
             JsObject(Seq("messages" -> JsArray(messages.map(_.toJson))))
           )
         )
      }
   }



}
