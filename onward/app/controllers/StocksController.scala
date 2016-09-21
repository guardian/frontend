package controllers

import common.JsonComponent
import model.Cached
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import business.{StocksData, Stocks}
import scala.concurrent.duration._
import conf.switches.Switches.StocksWidgetSwitch

class StocksController(stocksData: StocksData) extends Controller {
  def stocks = Action { implicit request =>
    if (StocksWidgetSwitch.isSwitchedOff) {
      Cached(1.minute)(JsonComponent(Stocks(Seq.empty)))
    } else {
      stocksData.get match {
        case None => InternalServerError("Business data not loaded")
        case Some(stocks) =>
          Cached(1.minute)(JsonComponent(stocks))
      }
    }
  }
}
