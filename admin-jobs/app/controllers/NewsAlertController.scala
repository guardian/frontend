package controllers

import model.Cached
import models.NewsAlertNotification
import play.api.libs.json.Json
import play.api.mvc._
import play.api.mvc.BodyParsers.parse.{json => BodyJson}

import scala.concurrent.Future

object NewsAlertController extends Controller {
  def alerts() = Action {
    Cached(30)(Ok("No alert yet"))
  }

  def create() : Action[NewsAlertNotification] = Action.async(BodyJson[NewsAlertNotification]) { request =>
    val n = request.body
    //mirror request body for now
    Future.successful(Created(Json.toJson(n)))
  }
}
