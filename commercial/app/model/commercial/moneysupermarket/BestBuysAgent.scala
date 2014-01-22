package model.commercial.moneysupermarket

import model.commercial.Segment

object BestBuysAgent {

  protected val agents = Seq(LoansAgent, EasyAccessAgent)

  def adsTargetedAt(segment: Segment): (Seq[Loan], Seq[EasyAccessProduct]) = {
    (
      LoansAgent.currentAds.sortBy(_.index).take(3),
      EasyAccessAgent.currentAds.sortBy(_.interestRate).take(3)
      )
  }

  def refresh() {
    agents foreach (_.refresh())
  }

  def stop() {
    agents foreach (_.stop())
  }
}
