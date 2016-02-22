package controllers

import common.{JsonComponent, ExecutionContexts, Logging}
import conf.Configuration
import model.NoCache
import model.notifications.{LatestNotificationsDynamoDbStore, DynamoDbStore}
import play.api.data.Form
import play.api.data.Forms._
import play.api.libs.json.{JsString, JsArray, JsObject}
import play.api.mvc.{Action, Controller}
import play.api.libs.ws._
import play.api.Play.current
import play.api.libs.json._


import scala.concurrent.Future

case class Subscription(notificationTopicId: String, gcmBrowserId: String)
case class TestMessage(gcmBrowserId: String, title: String, body: String)


object NotificationsController extends Controller with ExecutionContexts with Logging {

    //curl --header "Authorization: key=AIzaSyBnqI_GGFus_LVy80sMo-Ngo_t3X1dDb4w" --header "Content-Type: application/json" https://android.googleapis.com/gcm/send -d '{"to": "/topics/test", "data": {"message": "This is a GCM Topic Message!" } }'

    val gcmAuthKey = Configuration.notifications.gcmAuthorinzationKey
    val gcmIdApi = "https://iid.googleapis.com/iid/v1"
    val gcmSendApi = "https://android.googleapis.com/gcm/send"
    val headers = Seq("Content-Type" -> "application/json", "Authorization" -> s"key=$gcmAuthKey")

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

    //curl --header "Authorization: key=AIzaSyBnqI_GGFus_LVy80sMo-Ngo_t3X1dDb4w" --header "Content-Type: application/json" https://iid.googleapis.com/iid/v1/eBxZUsEbsZo:APA91bEyYUCqFYpi9QrqiltSeK6DjHh_5eRUkvDCmvirdLLyKW1WESyEt4garkQzJTj_uNl74vfJMM9XTYz4PXZWGD4PX98UGr38N6EGtf_Rd853B5BFk_q-NKh_VM54Bzu5_fCoMAxf/rel/topics/test

  def subscribeToTopic() = Action.async { implicit request =>
      form.bindFromRequest.fold(
        errors => {
          Future.successful(BadRequest)
        },
        topicInfo => {
          val url = s"$gcmIdApi/${topicInfo.gcmBrowserId}/rel/topics/${topicInfo.notificationTopicId}"
          val response = WS.url(url).withHeaders(headers:_*).get()
          response.flatMap { res =>
            res.status match {
              case 200 => Future.successful(Ok)
              case _ => Future.successful(BadRequest)
            }
          }
        }
      )
  }

/*
  curl --header "Authorization: key=AIzaSyBnqI_GGFus_LVy80sMo-Ngo_t3X1dDb4w" --header "Content-Type: application/json"
  https://android.googleapis.com/gcm/send -d '{"to": "/topics/test", "data": {"message": "This is a GCM Topic Message!" } }'
*/

  def sendMessageToTopic()  = Action.async{ implicit request =>
      val messageData = Json.obj("to" -> "/topics/test", "data" -> Json.obj("message" -> "This is a GCM topic message"))
      val sendResponse = WS.url(gcmSendApi).withHeaders(headers:_*).post(messageData)

      sendResponse.flatMap { res =>
        res.status match {
          case 200 => Future.successful(Ok)
          case _ => Future.successful(BadRequest)
        }
      }
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

     LatestNotificationsDynamoDbStore.getLatestMessageAndDoConditionalWrite(gcmBrowserId) map {
       messages =>
         messages match {
           case Some(m) =>
             NoCache(
               JsonComponent(
                 JsObject(
                   Seq("status" -> JsString("ok"), "messages" -> JsArray(m.map(_.toJson)))
                 )
               )
             )

           case _ =>
             NoCache(
                JsonComponent("status" -> JsString("error"))
             )
         }
      }
   }
}
