package controllers.commercial

import model.commercial.money._
import model.{NoCache, Cached}
import performance.MemcachedAction
import play.api.mvc._
import play.api.templates.Html
import scala.concurrent.Future

object MoneyOffers extends Controller {

  object lowRelevance extends BestBuysRelevance {
    override def view(bestBuys: BestBuys)(implicit request: RequestHeader): Html =
      views.html.moneysupermarket.bestBuys(bestBuys)
  }

  object highRelevance extends BestBuysRelevance {
    override def view(bestBuys: BestBuys)(implicit request: RequestHeader): Html =
      views.html.moneysupermarket.bestBuysHigh(bestBuys)
  }

  private def bestBuys(relevance: BestBuysRelevance, format: Format) = MemcachedAction { implicit request =>
    Future.successful {
      BestBuysAgent.adsTargetedAt(segment) match {
        case Some(products) => Cached(componentMaxAge)(format.result(relevance.view(products)))
        case None => NoCache(format.nilResult)
      }
    }
  }

  def bestBuysLowHtml = bestBuys(lowRelevance, htmlFormat)
  def bestBuysLowJson = bestBuys(lowRelevance, jsonFormat)

  def bestBuysHighHtml = bestBuys(highRelevance, htmlFormat)
  def bestBuysHighJson = bestBuys(highRelevance, jsonFormat)

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


sealed trait BestBuysRelevance {
  def view(bestBuys: BestBuys)(implicit request: RequestHeader): Html
}
