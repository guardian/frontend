package controllers.commercial

import play.api.mvc._
import model.Cached
import common.JsonComponent
import model.commercial.money.BestBuysAgent
import model.Page

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

  def savingsEasyAccess = Action { implicit request =>
    Cached(60)(Ok(views.html.moneysupermarket.savings.easyAccess(
      Page("moneysupermarket-savings", "money", "Moneysupermarket | Savings", "GFE:moneysupermarket"),
      BestBuysAgent.adsTargetedAt(segment).map(_.savings).getOrElse(Nil)))
    )
  }

  def currentAccountsRewards = Action { implicit request =>
    Cached(60)(Ok(views.html.moneysupermarket.currentAccounts.rewards(Page(
      "moneysupermarket-current-accounts", "money", "Moneysupermarket | Current Accounts", "GFE:moneysupermarket"),
      BestBuysAgent.adsTargetedAt(segment).map(_.currentAccounts).getOrElse(Nil)))
    )
  }

  def creditCardsBalanceTransferAndPurchases = Action { implicit request =>
    Cached(60)(Ok(views.html.moneysupermarket.creditCards.balanceTransferAndPurchases(Page(
      "moneysupermarket-credit-cards", "money", "Moneysupermarket | Credit Cards", "GFE:moneysupermarket"),
      BestBuysAgent.adsTargetedAt(segment).map(_.creditCards).getOrElse(Nil)))
    )
  }

  def loansGoodCredit = loans("Good")
  def loansFairCredit = loans("Fair")
  def loansPoorCredit = loans("Poor")
  def loans(loanCategory: String) = Action { implicit request =>
    Cached(60)(Ok(views.html.moneysupermarket.loans(Page(
      "moneysupermarket-loans", "money", "Moneysupermarket | Loans", "GFE:moneysupermarket"),
      BestBuysAgent.adsTargetedAt(segment).map(_.loans).getOrElse(Nil).filter(_.categoryName == loanCategory)))
    )
  }

}
