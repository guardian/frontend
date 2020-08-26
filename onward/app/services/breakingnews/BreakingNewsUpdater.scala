package services.breakingnews

import akka.actor.Status.{Failure => ActorFailure}
import akka.actor.{Actor, Props}
import common.{Logging}
import models.BreakingNewsFormats._
import models.{BreakingNews, NewsAlertNotification}
import play.api.libs.json.{JsValue, Json}

sealed trait BreakingNewsUpdaterMessage
case class NewNotificationRequest(notification: NewsAlertNotification) extends BreakingNewsUpdaterMessage
case object GetAlertsRequest extends BreakingNewsUpdaterMessage

class BreakingNewsUpdater(breakingNewsApi: BreakingNewsApi) extends Actor with Logging {

  def getAlerts(): Unit = {
    val origin = sender
    try {
      origin ! breakingNewsApi.getBreakingNews
    } catch {
      case e: Throwable =>
        log.error(s"Cannot fetching Breaking News (${e.getMessage})")
        origin ! ActorFailure(e)
    }

  }

  def addNotification(notification: NewsAlertNotification): Unit = {

    val origin = sender

    //TODO: improvement: cache BreakingNews content to avoid calling S3 every single time
    def fetch = breakingNewsApi.getBreakingNews
    def parse(json: JsValue) = Some(json.as[BreakingNews])
    def save(b: BreakingNews) = Some(breakingNewsApi.putBreakingNews(Json.toJson(b)))

    try {
      val result = for {
        currentBreakingNewsJson <- fetch
        currentBreakingNews <- parse(currentBreakingNewsJson)
        didSave <- save(BreakingNews(currentBreakingNews.alerts + notification))
      } yield didSave

      result match {
        case Some(true) => origin ! notification //mirroring back the received notification
        case _          => throw new Exception("Error while saving Breaking News content")
      }

    } catch {
      case e: Throwable =>
        log.error(s"Cannot update Breaking News (${e.getMessage})")
        origin ! ActorFailure(e)
    }

  }

  override def receive: PartialFunction[Any, Unit] = {
    case GetAlertsRequest          => getAlerts()
    case r: NewNotificationRequest => addNotification(r.notification)
    case _ @unknown                => log.error(s"Message unsupported (${unknown})")
  }
}

object BreakingNewsUpdater {
  def props(b: BreakingNewsApi): Props = Props(new BreakingNewsUpdater(b))
}
