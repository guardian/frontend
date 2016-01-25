package controllers

import common.ExecutionContexts
import model.Cached
import models.{BreakingNews, NewsAlertNotification}
import play.api.libs.json._
import play.api.mvc.BodyParsers.parse.{json => BodyJson}
import play.api.mvc._

trait NewsAlertController extends Controller with ExecutionContexts
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
    // Generating json output
    val breakingNewsJson : JsValue = Json.toJson(BreakingNews(Set(receivedNotification)))
    // Writing to S3
    breakingNewsApi.putBreakingNews(breakingNewsJson) map {
      case true => Created(Json.toJson(receivedNotification)) // mirroring back the received notification
      case false => InternalServerError(Json.toJson(NewsAlertError("Error while creating new notification")))
    }

  }
}

object NewsAlertController extends NewsAlertController {
  lazy val breakingNewsApi: BreakingNewsApi = BreakingNewsApi
}
