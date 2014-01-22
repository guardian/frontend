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
        case (products, "json") => Cached(60)(JsonComponent(views.html.moneysupermarket.bestBuys(products._1, products._2, products._3)))
        case (products, "html") => Cached(60)(Ok(views.html.moneysupermarket.bestBuys(products._1, products._2, products._3)))
      }
  }
}
