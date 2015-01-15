package controllers

import common.JsonComponent
import model.Cached
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import business.HideousHack
import scala.concurrent.duration._

object StocksController extends Controller {
  def stocks = Action { implicit request =>
    HideousHack.get match {
      case None => InternalServerError("Business data not loaded")
      case Some(stocks) =>
        Cached(1.minute)(JsonComponent.forJsValue(Json.toJson(stocks)))
    }
  }
}
