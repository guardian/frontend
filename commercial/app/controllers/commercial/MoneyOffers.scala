package controllers.commercial

import play.api.mvc._
import model.Cached
import model.commercial.moneysupermarket.{BestBuysAgent, EasyAccessAgent}
import common.JsonComponent

object MoneyOffers extends Controller {

  def bestBuys(format: String) = Action {
    implicit request =>
      (BestBuysAgent.adsTargetedAt(segment), format) match {
        case ((Nil, Nil), _) => NotFound
        case (products, "json") => Cached(60)(JsonComponent(views.html.moneysupermarket.bestBuys(products._1, products._2)))
        case (products, "html") => Cached(60)(Ok(views.html.moneysupermarket.bestBuys(products._1, products._2)))
      }
  }

  def easyAccessProductsHtml = Action {
    implicit request =>
      EasyAccessAgent.adsTargetedAt(segment) match {
        case Nil => NotFound
        case products => Cached(60)(Ok(views.html.moneysupermarket.easyAccess(products take 3)))
      }
  }

  def easyAccessProductsJson = Action {
    implicit request =>
      EasyAccessAgent.adsTargetedAt(segment) match {
        case Nil => NotFound
        case products => Cached(60)(JsonComponent(views.html.moneysupermarket.easyAccess(products take 3)))
      }
  }
}
