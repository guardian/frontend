package controllers

import common.JsonComponent
import model.Cached
import play.api.mvc.{BaseController, ControllerComponents}
import business.{Stocks, StocksData}

import scala.concurrent.duration._
import conf.switches.Switches.StocksWidgetSwitch

class StocksController(stocksData: StocksData, val controllerComponents: ControllerComponents) extends BaseController {
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
