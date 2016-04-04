package controllers

import common.{ExecutionContexts, JsonComponent, Logging}
import conf.Configuration
import model.NoCache
import model.notifications.DynamoDbStore
import play.api.data.Form
import play.api.data.Forms._
import play.api.libs.json._
import play.api.mvc.{Action, Controller}

import scala.concurrent.Future

case class Subscription(notificationTopicId: String, gcmBrowserId: String)
case class TestMessage(gcmBrowserId: String, title: String, body: String)


object NotificationsController extends Controller with ExecutionContexts with Logging {

  val form = Form(mapping(
    "notificationTopicId" -> nonEmptyText,
    "gcmBrowserId" -> nonEmptyText
  )(Subscription.apply)(Subscription.unapply)
  )
  def saveSubscription() = Action.async { implicit request =>
    form.bindFromRequest.fold(
      errors => {
        Future.successful(NoCache(BadRequest))
      },
      data => {
        DynamoDbStore.addItemToSubcription(data.gcmBrowserId, data.notificationTopicId)
        Future.successful(NoCache(Ok))
      }
    )
  }

  def deleteSubscription() = Action.async { implicit request =>
    form.bindFromRequest.fold(
      errors => {
        Future.successful(NoCache(BadRequest))
      },
      data => {
        DynamoDbStore.deleteItemFromSubcription(data.gcmBrowserId, data.notificationTopicId)
        Future.successful(NoCache(Ok))
      }
    )
  }
}
