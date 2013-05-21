package controllers.front

import common.Edition

//Responsible for bootstrapping the front (setting up the refresh schedule)
class ConfiguredFront extends Front {
  
  // Map of edition -> (path -> front)
  override lazy val fronts = Edition.all.map{ edition =>
    edition.id -> edition.configuredFronts.map{ case (name, blocks) =>
      name ->  new ConfiguredEdition(edition, blocks)
    }.toMap
  }.toMap

}

object ConfiguredFront extends ConfiguredFront