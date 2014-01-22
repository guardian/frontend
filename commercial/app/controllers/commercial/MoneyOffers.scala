package controllers.commercial

import play.api.mvc._
import model.Cached
import model.commercial.moneysupermarket.BestBuysAgent
import common.JsonComponent

object MoneyOffers extends Controller {

  def bestBuys(format: String) = Action {
    implicit request =>
      (BestBuysAgent.adsTargetedAt(segment), format) match {
        case ((Nil, Nil, Nil), _) => NotFound
        case ((creditCards, loans, savingsAccounts), "json") =>
          Cached(60)(JsonComponent(views.html.moneysupermarket.bestBuys(creditCards, loans, savingsAccounts)))
        case ((creditCards, loans, savingsAccounts), "html") =>
          Cached(60)(Ok(views.html.moneysupermarket.bestBuys(creditCards, loans, savingsAccounts)))
      }
  }
}
