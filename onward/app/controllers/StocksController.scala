package controllers

import common.JsonComponent
import model.Cached
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import business.{Stocks, StocksData}

import scala.concurrent.duration._
import conf.switches.Switches.StocksWidgetSwitch

class StocksController(stocksData: StocksData, val controllerComponents: ControllerComponents) extends BaseController {
  def stocks: Action[AnyContent] =
    Action { implicit request =>
      // Decommissioned, see marker: 7dde429f00b1
      if (false && StocksWidgetSwitch.isSwitchedOff) {
        Cached(1.minute)(JsonComponent.fromWritable(Stocks(Seq.empty)))
      } else {
        stocksData.get match {
          case None         => InternalServerError("Business data not loaded")
          case Some(stocks) =>
            Cached(1.minute)(JsonComponent.fromWritable(stocks))
        }
      }
    }
}
