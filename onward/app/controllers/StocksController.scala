package controllers

import common.JsonComponent
import model.Cached
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import business.{StocksData, Stocks}
import scala.concurrent.duration._
import conf.switches.Switches.StocksWidgetSwitch

object StocksController extends Controller {
  def stocks = Action { implicit request =>
    if (StocksWidgetSwitch.isSwitchedOff) {
      Cached(1.minute)(JsonComponent.forJsValue(Json.toJson(Stocks(Seq.empty))))
    } else {
      StocksData.get match {
        case None => InternalServerError("Business data not loaded")
        case Some(stocks) =>
          Cached(1.minute)(JsonComponent.forJsValue(Json.toJson(stocks)))
      }
    }
  }
}
