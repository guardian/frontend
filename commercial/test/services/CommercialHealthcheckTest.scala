package services

import model.commercial.masterclasses.MasterClassAgent

class CommercialHealthcheckTest extends HealthcheckTest("/commercial/masterclasses?s=music") {

  override def prepareForTest() {
    MasterClassAgent.getUpcoming
  }
}
