package services

import model.commercial.books.BestsellersAgent
import model.commercial.jobs.JobsAgent
import model.commercial.masterclasses.MasterClassAgent
import model.commercial.money.BestBuysAgent
import model.commercial.soulmates.SoulmatesAggregatingAgent
import model.commercial.travel.OffersAgent

class CommercialHealthcheckTest extends HealthcheckTest("/") {

  override def prepareForTest() {
    SoulmatesAggregatingAgent.refresh()
    MasterClassAgent.refresh()
    OffersAgent.refresh()
    JobsAgent.refresh()
    BestBuysAgent.refresh()
    BestsellersAgent.refresh()
  }
}
