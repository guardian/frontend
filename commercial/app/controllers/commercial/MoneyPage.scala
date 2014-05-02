package controllers.commercial

import model.Page

trait MoneyPage{
  def parentId: String
  def id: String
  def parentWebTitle: String
  def webTitle: String
  def description: String
  def meta: Page = Page(s"commercial/money/$parentId/$id", "money", s"$webTitle | $parentWebTitle", s"GFE:money:moneysupermarket:$parentId:$id")
}

// Current Account pages
class CurrentAccountsPage(val id: String, val webTitle: String, val description: String) extends MoneyPage {
  val parentId = "current-accounts"
  val parentWebTitle = "Current Accounts"
}
object CurrentAccountsPage {
  def apply(id: String, title: String, description: String) = new CurrentAccountsPage(id, title, description)
}
object CurrentAccountPages {
  val pages: Seq[CurrentAccountsPage] = Seq(
    CurrentAccountsPage("reward-incentive", "Reward/Incentive", "Current accounts listed by reward amount"),
    CurrentAccountsPage("high-interest", "High Interest", "Current accounts listed by interest (AER)"),
    CurrentAccountsPage("overdraft", "Overdraft", "Current accounts listed by overdraft rate (EAR)"),
    CurrentAccountsPage("with-benefits", "With Benefits", "Current accounts listed by benefit amount"),
    CurrentAccountsPage("basic-accounts", "Basic Accounts", "Current accounts listed by monthly service charge"),
    CurrentAccountsPage("standard-accounts", "Standard Accounts", "Current accounts listed by interest (AER) and overdraft rate (EAR)")
  )
  def find(id: String): Option[CurrentAccountsPage] = pages.find(_.id == id)
}

// Credit Card pages
class CreditCardPage(val id: String, val webTitle: String, val description: String) extends MoneyPage {
  val parentId = "credit-cards"
  val parentWebTitle = "Credit Cards"
}
object CreditCardPage {
  def apply(id: String, title: String, description: String) = new CreditCardPage(id, title, description)
}
object CreditCardPages {
  val pages: Seq[CreditCardPage] = Seq(
    CreditCardPage("balance-transfer", "Balance Transfer", "Cards listed by duration of 0% balance transfer offer"),
    CreditCardPage("purchases", "Purchases", "Cards listed by duration of 0% balance transfer offer"),
    CreditCardPage("balance-transfer-and-purchases", "Balance Transfer &amp; Purchases", "Cards listed by combined duration of 0% balance transfer and purchase offer"),
    CreditCardPage("cashback", "Cashback", "Cards listed in order of cashback rate"),
    CreditCardPage("low-standard-rate", "Low Standard Rate", "Cards with an APR less than 13% are listed by interest rate (APR)"),
    CreditCardPage("rewards", "Rewards", "Reward cards listed by most popular"),
    CreditCardPage("bad-credit", "Bad Credit", "Credit builder cards are displayed and listed in order of interest rate (APR)")
  )
  def find(id: String): Option[CreditCardPage] = pages.find(_.id == id)
}

// Savings pages
class SavingsPage(val id: String, val webTitle: String) extends MoneyPage {
  val parentId = "savings"
  val parentWebTitle = "Savings"
  val description = "Savings accounts listed by interest (AER)"
}
object SavingsPage {
  def apply(id: String, title: String) = new SavingsPage(id, title)
}
object SavingsPages {
  val pages: Seq[SavingsPage] = Seq(
    SavingsPage("cash-isas", "Cash ISAs"),
    SavingsPage("easy-access", "Easy Access"),
    SavingsPage("fixed-rate-bonds", "Fixed Rate Bonds"),
    SavingsPage("regular-savings", "Regular Savings"),
    SavingsPage("childrens-accounts", "Children's Accounts"),
    SavingsPage("notice-accounts", "Notice Accounts"),
    SavingsPage("offshore-accounts", "Offshore Accounts")
  )
  def find(id: String): Option[SavingsPage] = pages.find(_.id == id)
}

// Loan pages
class LoansPage(val id: String, val webTitle: String, val category: String) extends MoneyPage {
  val parentId = "loans"
  val parentWebTitle = "Loans"
  val description = "Select your credit profile, Good, Fair or Poor to compare the best loans for you"
}
object LoansPage {
  def apply(id: String, title: String, category: String) = new LoansPage(id, title, category)
}
object LoansPages {
  val pages: Seq[LoansPage] = Seq(
    LoansPage("good-credit-profile", "Good Credit Profile", "Good"),
    LoansPage("fair-credit-profile", "Fair Credit Profile", "Fair"),
    LoansPage("poor-credit-profile", "Poor Credit Profile", "Poor")
  )
  def find(id: String): Option[LoansPage] = pages.find(_.id == id)
}
