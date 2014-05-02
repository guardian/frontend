package controllers.commercial

import play.api.mvc._
import model.Cached
import common.JsonComponent
import model.commercial.money._

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

  def savings(savingsType: String) = Action { implicit request =>
    SavingsPages.find(savingsType).map { page =>
      val savings: Seq[SavingsAccount] = BestBuysAgent.adsTargetedAt(segment).flatMap(_.savings.get(savingsType)).getOrElse(Nil)
      Cached(60)(Ok(views.html.moneysupermarket.savings.render(page, savings)))
    }.getOrElse {
      Cached(60)(NotFound)
    }
  }

  def currentAccounts(currentAccountType: String) = Action { implicit request =>
    CurrentAccountsPages.find(currentAccountType).map { page =>
      val currentAccounts: Seq[CurrentAccount] = BestBuysAgent.adsTargetedAt(segment).flatMap(_.currentAccounts.get(currentAccountType)).getOrElse(Nil)
      Cached(60)(Ok(views.html.moneysupermarket.currentAccounts.render(page, currentAccounts)))
    }.getOrElse {
      Cached(60)(NotFound)
    }
  }

  def creditCards(creditCardType: String) = Action { implicit request =>
    CreditCardsPages.find(creditCardType).map { page =>
      val creditCards: Seq[CreditCard] = BestBuysAgent.adsTargetedAt(segment).flatMap(_.creditCards.get(creditCardType)).getOrElse(Nil)
      Cached(60)(Ok(views.html.moneysupermarket.creditCards.render(page, creditCards)))
    }.getOrElse {
      Cached(60)(NotFound)
    }
  }

  def loans(loanType: String) = Action { implicit request =>
    LoansPages.find(loanType).map { page =>
      val loans: Seq[Loan] = BestBuysAgent.adsTargetedAt(segment).map(_.loans).getOrElse(Nil).filter(_.categoryName == page.category)
      Cached(60)(Ok(views.html.moneysupermarket.loans(page, loans)))
    }.getOrElse {
      Cached(60)(NotFound)
    }
  }

}
