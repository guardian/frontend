package agents

import common.{Box, GuLogging}
import model.dotcomrendering.{OnwardCollectionResponse, Trail}

class DeeplyReadAgent extends GuLogging {
  private val trailsBox = Box[Seq[Trail]](Seq())
  def onwardsJourneyResponse = {
    OnwardCollectionResponse(
      heading = "Deeply read",
      trails = trailsBox.get(),
    )
  }

  def getTrails = {
    trailsBox.get()
  }
}
