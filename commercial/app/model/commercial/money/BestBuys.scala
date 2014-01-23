package model.commercial.money

import model.commercial.Segment

case class BestBuys(
                     creditCards: Seq[CreditCard],
                     loans: Seq[Loan],
                     currentAccounts: Seq[CurrentAccount],
                     savings: Seq[SavingsAccount]
                     )


object BestBuysAgent {

  protected val agents = Seq(
    CreditCardsAgent,
    LoansAgent,
    CurrentAccountsAgent,
    SavingsAgent
  )

  def adsTargetedAt(segment: Segment): Option[BestBuys] = {
    val creditCards = CreditCardsAgent.currentAds
    val loans = LoansAgent.currentAds
    val currentAccounts = CurrentAccountsAgent.currentAds
    val savings = SavingsAgent.currentAds

    if (creditCards.isEmpty && loans.isEmpty && currentAccounts.isEmpty && savings.isEmpty) {
      None
    } else {
      Some(BestBuys(creditCards, loans, currentAccounts, savings))
    }
  }

  def refresh() {
    agents foreach (_.refresh())
  }

  def stop() {
    agents foreach (_.stop())
  }
}
