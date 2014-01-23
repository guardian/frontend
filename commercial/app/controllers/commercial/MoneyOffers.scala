package controllers.commercial

import play.api.mvc._
import model.Cached
import common.JsonComponent
import model.commercial.money.BestBuysAgent

object MoneyOffers extends Controller {

  def bestBuys(format: String) = Action {
    implicit request =>
      (BestBuysAgent.adsTargetedAt(segment), format) match {
        case (Some(products), "json") =>
          Cached(60)(JsonComponent(views.html.moneysupermarket.bestBuys(products)))
        case (Some(products), "html") =>
          Cached(60)(Ok(views.html.moneysupermarket.bestBuys(products)))
        case _ => NotFound
      }
  }
}
