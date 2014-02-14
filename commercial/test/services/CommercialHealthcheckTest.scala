package services

import model.commercial.masterclasses.MasterClassAgent

class CommercialHealthcheckTest extends HealthcheckTest("/commercial/jobs.json?seg=repeat&s=business&k=science") {

  override def prepareForTest() {
    MasterClassAgent.getUpcoming
  }
}
