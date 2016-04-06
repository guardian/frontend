package controllers.commercial

import model.commercial.money._
import model.{NoCache, Cached}
import play.api.mvc._
import play.twirl.api.Html
import scala.concurrent.Future

object MoneyOffers extends Controller with implicits.Requests {

  def renderBestBuys = Action.async { implicit request =>
    Future.successful {
      BestBuysAgent.adsTargetedAt(segment) match {
        case Some(bestBuys) => {
          val clickMacro = request.getParameter("clickMacro")
          val omnitureId = request.getParameter("omnitureId")
          Cached(componentMaxAge)(jsonFormat.result(views.html.moneysupermarket.bestBuys(bestBuys, omnitureId, clickMacro)))
        }
        case None => NoCache(jsonFormat.nilResult)
      }
    }
  }

  def savings(savingsType: String) = Action.async { implicit request =>
    Future.successful {
      SavingsPages.find(savingsType).fold(Cached(componentMaxAge)(NotFound)) { page =>
        val savings = BestBuysAgent.adsTargetedAt(segment).flatMap(_.savings.get(savingsType)).getOrElse(Nil)
        Cached(componentMaxAge)(Ok(views.html.moneysupermarket.savings.render(page, savings)))
      }
    }
  }

  def currentAccounts(currentAccountType: String) = Action.async { implicit request =>
    Future.successful {
      CurrentAccountsPages.find(currentAccountType).fold(Cached(componentMaxAge)(NotFound)) { page =>
        val currentAccounts = BestBuysAgent.adsTargetedAt(segment).flatMap(_.currentAccounts.get(currentAccountType))
          .getOrElse(Nil)
        Cached(componentMaxAge)(Ok(views.html.moneysupermarket.currentAccounts.render(page, currentAccounts)))
      }
    }
  }

  def creditCards(creditCardType: String) = Action.async { implicit request =>
    Future.successful {
      CreditCardsPages.find(creditCardType).fold(Cached(componentMaxAge)(NotFound)) { page =>
        val creditCards = BestBuysAgent.adsTargetedAt(segment).flatMap(_.creditCards.get(creditCardType)).getOrElse(Nil)
        Cached(componentMaxAge)(Ok(views.html.moneysupermarket.creditCards.render(page, creditCards)))
      }
    }
  }

  def loans(loanType: String) = Action.async { implicit request =>
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
