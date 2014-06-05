package controllers.commercial

import common.JsonComponent
import model.{NoCache, Cached}
import model.commercial.money._
import performance.MemcachedAction
import play.api.mvc._
import scala.concurrent.Future

object MoneyOffers extends Controller {

  private def bestBuys(format: Format) = MemcachedAction { implicit request =>
    Future.successful {
      BestBuysAgent.adsTargetedAt(segment) match {
        case Some(products) =>
          Cached(componentMaxAge) {
            format.result(views.html.moneysupermarket.bestBuys(products))
          }
        case None => NoCache(format.nilResult)
      }
    }
  }

  def bestBuysHtml = bestBuys(htmlFormat)
  def bestBuysJson = bestBuys(jsonFormat)


  def savings(savingsType: String) = MemcachedAction { implicit request =>
    Future.successful {
      SavingsPages.find(savingsType).fold(Cached(componentMaxAge)(NotFound)) { page =>
        val savings = BestBuysAgent.adsTargetedAt(segment).flatMap(_.savings.get(savingsType)).getOrElse(Nil)
        Cached(componentMaxAge)(Ok(views.html.moneysupermarket.savings.render(page, savings)))
      }
    }
  }

  def currentAccounts(currentAccountType: String) = MemcachedAction { implicit request =>
    Future.successful {
      CurrentAccountsPages.find(currentAccountType).fold(Cached(componentMaxAge)(NotFound)) { page =>
        val currentAccounts = BestBuysAgent.adsTargetedAt(segment).flatMap(_.currentAccounts.get(currentAccountType))
          .getOrElse(Nil)
        Cached(componentMaxAge)(Ok(views.html.moneysupermarket.currentAccounts.render(page, currentAccounts)))
      }
    }
  }

  def creditCards(creditCardType: String) = MemcachedAction { implicit request =>
    Future.successful {
      CreditCardsPages.find(creditCardType).fold(Cached(componentMaxAge)(NotFound)) { page =>
        val creditCards = BestBuysAgent.adsTargetedAt(segment).flatMap(_.creditCards.get(creditCardType)).getOrElse(Nil)
        Cached(componentMaxAge)(Ok(views.html.moneysupermarket.creditCards.render(page, creditCards)))
      }
    }
  }

  def loans(loanType: String) = MemcachedAction { implicit request =>
    Future.successful {
      LoansPages.find(loanType).fold(Cached(componentMaxAge)(NotFound)) { page =>
        val loans = BestBuysAgent.adsTargetedAt(segment).map(_.loans).getOrElse(Nil).filter(_.categoryName == page
          .category)
        Cached(componentMaxAge)(Ok(views.html.moneysupermarket.loans(page, loans)))
      }
    }
  }

}
