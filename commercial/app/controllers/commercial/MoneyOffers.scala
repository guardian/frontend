package controllers.commercial

import play.api.mvc._
import model.Cached
import common.JsonComponent
import model.commercial.money.{SavingsAccount, CreditCard, CurrentAccount, BestBuysAgent}
import model.Page

trait MoneyPage{
  def parentId: String
  def id: String
  def parentWebTitle: String
  def webTitle: String
  def description: String
  def meta: Page = Page(s"commercial/money/$parentId/$id", "money", s"$webTitle | $parentWebTitle", s"GFE:money:moneysupermarket:$parentId:$id")
}
class CurrentAccountsPage(val id: String, val webTitle: String, val description: String) extends MoneyPage {
  val parentId = "current-accounts"
  val parentWebTitle = "Current Accounts"
}
object CurrentAccountsPage {
  def apply(currentAccountsId: String, currentAccountsTitle: String, description: String)
    = new CurrentAccountsPage(currentAccountsId, currentAccountsTitle, description)
}

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
    val savings: Seq[SavingsAccount] = BestBuysAgent.adsTargetedAt(segment).flatMap(_.savings.get(savingsType)).getOrElse(Nil)
    Cached(60)(Ok(views.html.moneysupermarket.savings.render(
      Page("moneysupermarket-savings", "money", "Moneysupermarket | Savings", "GFE:moneysupermarket"),
      savings,
      savingsType
    )))
  }

  def currentAccounts(currentAccountType: String) = Action { implicit request =>
    val currentAccounts: Seq[CurrentAccount] = BestBuysAgent.adsTargetedAt(segment).flatMap(_.currentAccounts.get(currentAccountType)).getOrElse(Nil)
    Seq(
      CurrentAccountsPage("reward-incentive", "Reward/Incentive", "Current accounts listed by reward amount"),
      CurrentAccountsPage("high-interest", "High Interest", "Current accounts listed by interest (AER)"),
      CurrentAccountsPage("overdraft", "Overdraft", "Current accounts listed by overdraft rate (EAR)"),
      CurrentAccountsPage("with-benefits", "With Benefits", "Current accounts listed by benefit amount"),
      CurrentAccountsPage("basic-accounts", "Basic Accounts", "Current accounts listed by monthly service charge"),
      CurrentAccountsPage("standard-accounts", "Standard Accounts", "Current accounts listed by interest (AER) and overdraft rate (EAR)")
    ).find(_.id == currentAccountType).map { page =>
      Cached(60)(Ok(views.html.moneysupermarket.currentAccounts.render(page, currentAccounts)))
    }.getOrElse {
      Cached(60)(NotFound)
    }
  }

  def creditCards(creditCardType: String) = Action { implicit request =>
    val creditCards: Seq[CreditCard] = BestBuysAgent.adsTargetedAt(segment).flatMap(_.creditCards.get(creditCardType)).getOrElse(Nil)
    Cached(60)(Ok(views.html.moneysupermarket.creditCards.render(
      Page("moneysupermarket-credit-cards", "money", "Moneysupermarket | Credit Cards", "GFE:moneysupermarket"),
      creditCards,
      creditCardType
    )))
  }

  def loansGoodCredit = loans("Good")
  def loansFairCredit = loans("Fair")
  def loansPoorCredit = loans("Poor")
  def loans(loanCategory: String) = Action { implicit request =>
    Cached(60)(Ok(views.html.moneysupermarket.loans(
      Page("moneysupermarket-loans", "money", "Moneysupermarket | Loans", "GFE:moneysupermarket"),
      BestBuysAgent.adsTargetedAt(segment).map(_.loans).getOrElse(Nil).filter(_.categoryName == loanCategory)))
    )
  }

}
