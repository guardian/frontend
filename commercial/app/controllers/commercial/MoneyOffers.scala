package controllers.commercial

import play.api.mvc._
import model.Cached
import model.commercial.moneysupermarket.EasyAccessAgent
import common.JsonComponent

object MoneyOffers extends Controller {

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
