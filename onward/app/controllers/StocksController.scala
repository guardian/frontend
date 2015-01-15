package controllers

import play.api.mvc.{Action, Controller}
import business.{Data => BusinessData}

object StocksController extends Controller {
  def stocks = Action {
    BusinessData.agent.get() match {
      case None => InternalServerError("Business data not loaded")
      case Some(data) =>

        Ok("LOL")

    }
  }
}
