package model.commercial.money

import model.commercial.Segment

case class BestBuys(creditCards: Map[String, Seq[CreditCard]],
                    loans: Seq[Loan],
                    currentAccounts: Map[String, Seq[CurrentAccount]],
                    savings: Map[String, Seq[SavingsAccount]],
                    mortgages: Seq[Mortgage])


object BestBuysAgent {

  protected val agents = Seq(
    LoansAgent,
    creditCardsAgent.BalanceTransfer,
    creditCardsAgent.Purchase,
    creditCardsAgent.BalanceTransferAndPurchase,
    creditCardsAgent.Cashback,
    creditCardsAgent.LowStandardRate,
    creditCardsAgent.Rewards,
    creditCardsAgent.LowCredit,
    currentAccountsAgent.Rewards,
    currentAccountsAgent.HighInterest,
    currentAccountsAgent.BestOverdraft,
    currentAccountsAgent.WithBenefits,
    currentAccountsAgent.BasicAccounts,
    currentAccountsAgent.StandardAccounts,
    savingsAgent.CashIsas,
    savingsAgent.EasyAccess,
    savingsAgent.FixedRateBonds,
    savingsAgent.RegularSavings,
    savingsAgent.ChildrensAccounts,
    savingsAgent.NoticeAccounts,
    savingsAgent.OffshoreAccounts,
    MortgagesAgent
  )

  def adsTargetedAt(segment: Segment): Option[BestBuys] = {
    val creditCards = CreditCards.currentAds
    val loans = LoansAgent.available
    val currentAccounts = CurrentAccounts.currentAds
    val savings = SavingsAccounts.currentAds
    val mortgages = MortgagesAgent.available

    if (creditCards.isEmpty
      && loans.isEmpty
      && currentAccounts.isEmpty
      && savings.isEmpty
      && mortgages.isEmpty) {
      None
    } else {
      Some(BestBuys(creditCards, loans, currentAccounts, savings, mortgages))
    }
  }

  def refresh(): Unit = {
    agents foreach (_.refresh())
  }
}
