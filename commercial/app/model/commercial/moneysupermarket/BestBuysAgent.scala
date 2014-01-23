package model.commercial.moneysupermarket

import model.commercial.Segment

object BestBuysAgent {

  protected val agents = Seq(CreditCardsAgent, LoansAgent, SavingsAgent)

  def adsTargetedAt(segment: Segment): (Seq[CreditCard], Seq[Loan], Seq[SavingsAccount]) = {
    (
      CreditCardsAgent.currentAds,
      LoansAgent.currentAds,
      SavingsAgent.currentAds
      )
  }

  def refresh() {
    agents foreach (_.refresh())
  }

  def stop() {
    agents foreach (_.stop())
  }
}
