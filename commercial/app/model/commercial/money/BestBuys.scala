package model.commercial.money

import model.commercial.Segment

case class BestBuys(
                     mortgages: Seq[Mortgage],
                     creditCards: Map[String, Seq[CreditCard]],
                     loans: Seq[Loan],
                     currentAccounts: Map[String, Seq[CurrentAccount]],
                     savings: Seq[SavingsAccount]
                     )


object BestBuysAgent {

  protected val agents = Seq(
    MortgagesAgent,
    creditCardsAgent.BalanceTransfer,
    creditCardsAgent.Purchase,
    creditCardsAgent.BalanceTransferAndPurchase,
    creditCardsAgent.Cashback,
    creditCardsAgent.LowStandardRate,
    creditCardsAgent.Rewards,
    creditCardsAgent.LowCredit,
    LoansAgent,
    currentAccountsAgent.Rewards,
    currentAccountsAgent.HighInterest,
    currentAccountsAgent.BestOverdraft,
    currentAccountsAgent.WithBenefits,
    currentAccountsAgent.BasicAccounts,
    currentAccountsAgent.StandardAccounts,
    SavingsAgent
  )

  def adsTargetedAt(segment: Segment): Option[BestBuys] = {
    val mortgages = MortgagesAgent.currentAds
    val creditCards = CreditCards.currentAds
    val loans = LoansAgent.currentAds
    val currentAccounts = CurrentAccounts.currentAds
    val savings = SavingsAgent.currentAds

    if (mortgages.isEmpty
      && creditCards.isEmpty
      && loans.isEmpty
      && currentAccounts.isEmpty
      && savings.isEmpty) {
      None
    } else {
      Some(BestBuys(mortgages, creditCards, loans, currentAccounts, savings))
    }
  }

  def refresh() {
    agents foreach (_.refresh())
  }

  def stop() {
    agents foreach (_.stop())
  }
}
