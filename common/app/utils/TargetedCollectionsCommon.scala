package utils

import model.facia.PressedCollection

object TargetedCollectionsCommon {

  def pageContainsTargetedCollections(collections: List[PressedCollection]): Boolean =
    collections.exists(c => c.targetedTerritory.isDefined)
}
