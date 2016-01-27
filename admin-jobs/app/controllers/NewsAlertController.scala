package controllers

import common.{ExecutionContexts, Logging}
import model.Cached
import models.NewsAlertNotification
import play.api.libs.json.{Json, _}
import play.api.mvc.BodyParsers.parse.{json => BodyJson}
import play.api.mvc._

import scala.concurrent.Future

trait NewsAlertController extends Controller with Logging with ExecutionContexts
{

  case class NewsAlertError(error: String)
  implicit private val ew = Json.writes[NewsAlertError]

  val breakingNewsApi: BreakingNewsApi

  def alerts() = Action.async {
    breakingNewsApi.getBreakingNews map {
      case Some(jsonValue) =>
        Cached(30)(Ok(jsonValue))
      case None =>
        NoContent
    }
  }

  def create() : Action[NewsAlertNotification] = Action.async(BodyJson[NewsAlertNotification]) { request =>
    val receivedNotification : NewsAlertNotification = request.body
    val receivedNotificationJson = Json.toJson(receivedNotification)

    import models.BreakingNews
    import models.BreakingNewsFormats._
    def fetch = breakingNewsApi.getBreakingNews
    def parse(json : JsValue) = Future(json.as[BreakingNews])
    def save(b: BreakingNews) = breakingNewsApi.putBreakingNews(Json.toJson(b))

    val result = for {
      currentBreakingNewsJson <- fetch
      currentBreakingNews <- parse(currentBreakingNewsJson.get)
      didSave <- save(BreakingNews(currentBreakingNews.alerts + receivedNotification))
    } yield didSave

    result.map{
      case _ => Created(receivedNotificationJson) // mirroring back the received notification
    }.recover{
      case e: Throwable =>
        log.error(s"Cannot create a new alert (${e.getMessage})")
        InternalServerError(Json.toJson(NewsAlertError("Error while creating new notification")))
    }
  }
}

object NewsAlertController extends NewsAlertController {
  lazy val breakingNewsApi: BreakingNewsApi = BreakingNewsApi
}
