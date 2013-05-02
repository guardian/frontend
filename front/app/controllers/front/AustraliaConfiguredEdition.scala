package controllers.front

import model.TrailblockDescription

class AustraliaConfiguredEdition(edition: String, descriptions: Seq[TrailblockDescription])
  extends ConfiguredEdition(edition, descriptions) {

  override val manualAgents = descriptions.map(AustraliaTrailblockAgent(_, edition))
}
