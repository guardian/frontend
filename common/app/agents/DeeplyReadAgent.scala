package agents

import common.{Box, GuLogging}
import model.dotcomrendering.{OnwardCollectionResponse, OnwardItem}

class DeeplyReadAgent extends GuLogging {
  private val trailsBox = Box[Seq[OnwardItem]](Seq())
  def onwardsJourneyResponse = {
    OnwardCollectionResponse(
      heading = "Deeply read",
      trails = trailsBox.get(),
    )
  }
}
