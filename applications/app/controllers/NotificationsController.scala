package controllers

import common.{ExecutionContexts, Logging}
import model.NoCache
import model.notifications.DynamoDbStore
import play.api.data.Form
import play.api.data.Forms._
import play.api.mvc.{Action, Controller}

import scala.concurrent.Future

case class Subscription(notificationTopicId: String, browserEndpoint: String)

class NotificationsController extends Controller with ExecutionContexts with Logging {

  val form = Form(mapping(
    "notificationTopicId" -> nonEmptyText,
    "browserEndpoint" -> nonEmptyText
  )(Subscription.apply)(Subscription.unapply)
  )
  def saveSubscription() = Action.async { implicit request =>
    form.bindFromRequest.fold(
      errors => {
        Future.successful(NoCache(BadRequest))
      },
      data => {
        DynamoDbStore.addItemToSubscription(data.browserEndpoint, data.notificationTopicId)
          .map(_ => NoCache(Ok))
          .recover{ case t => NoCache(InternalServerError)}
      }
    )
  }

  def deleteSubscription() = Action.async { implicit request =>
    form.bindFromRequest.fold(
      errors => {
        Future.successful(NoCache(BadRequest))
      },
      data => {
        DynamoDbStore.deleteItemFromSubscription(data.browserEndpoint, data.notificationTopicId)
          .map(_ => NoCache(Ok))
          .recover{ case t => NoCache(InternalServerError)}
      }
    )
  }
}

object NotificationsController extends NotificationsController
