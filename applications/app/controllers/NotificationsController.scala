package controllers

import common.{ExecutionContexts, JsonComponent, Logging}
import conf.Configuration
import model.NoCache
import model.notifications.{DynamoDbStore, GCMMessage, RedisMessageStore}
import play.api.data.Form
import play.api.data.Forms._
import play.api.libs.json._
import play.api.mvc.{Action, Controller}

import scala.concurrent.Future

case class Subscription(notificationTopicId: String, gcmBrowserId: String)
case class TestMessage(gcmBrowserId: String, title: String, body: String)


object NotificationsController extends Controller with ExecutionContexts with Logging {

  val gcmAuthKey = Configuration.notifications.gcmAuthorinzationKey
  val headers = Seq("Content-Type" -> "application/json", "Authorization" -> s"key=$gcmAuthKey")

  val form = Form(mapping(
    "notificationTopicId" -> nonEmptyText,
    "gcmBrowserId" -> nonEmptyText
  )(Subscription.apply)(Subscription.unapply)
  )

  val newMessageForm = Form(mapping(
    "gcmBrowserId" -> nonEmptyText,
    "title" -> nonEmptyText,
    "body" -> nonEmptyText
  )(TestMessage.apply)(TestMessage.unapply)
  )

  val gcmMessageForm = Form(
    mapping(
      "clientId" -> nonEmptyText,
      "topic" -> nonEmptyText,
      "title" -> nonEmptyText,
      "body" -> nonEmptyText
    )(GCMMessage.apply)(GCMMessage.unapply)
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

  def saveARedlisMessage() = Action.async { implicit request =>

    println("Send to redlis")
    gcmMessageForm.bindFromRequest.fold(
      errors => {
        Future.successful(BadRequest)
      },
      msg => {
        println("Parsed form ")
        RedisMessageStore.leaveMessage(msg).flatMap {
          b =>
            println("Saved message")
            Future.successful(Ok)
        }
      }
    )
  }

  def getMessage(gcmBrowserId: String) = Action.async { implicit request =>
      RedisMessageStore.getMessages(gcmBrowserId).map {
          messages =>
            NoCache(
              JsonComponent(
                JsObject(
                  Seq("status" -> JsString("ok"),
                      "messages" -> JsArray(messages.map{ message => Json.toJson(message) }))
                )
              )
            )
      }
  }
}
