package model.commercial.moneysupermarket

import model.commercial.AdAgent
import common.ExecutionContexts

object MoneysupermarketAggregatingAgent {

  protected val agents = Seq(EasyAccessAgent)

  def refresh() {
    agents foreach (_.refresh())
  }

  def stop() {
    agents foreach (_.stop())
  }
}

object EasyAccessAgent extends AdAgent[EasyAccessProduct] with ExecutionContexts {

  def refresh() {
    for {
      products <- EasyAccessApi.getProducts
    } updateCurrentAds(products)
  }
}
