package utils

import com.gu.facia.client.models.{EU27Territory, NZTerritory, TargetedTerritory, USEastCoastTerritory}
import model.PressedPage
import model.facia.PressedCollection
import model.pressed.CollectionConfig

object TargetedCollections {
  // remove all collections with a targeted territory that is not allowed
  def filterCollections(faciaPage: PressedPage, allowedTerritories: List[TargetedTerritory]): PressedPage = {
    faciaPage.copy(collections = faciaPage.collections.filter{c =>
      c.targetedTerritory.forall(t => allowedTerritories.contains(t))
    })
  }

  val prettyTerritoryLookup: Map[TargetedTerritory, String] = Map(
    NZTerritory -> "New Zealand",
    EU27Territory -> "EU-27 Countries",
    USEastCoastTerritory -> "US East Coast"
  )

  def markDisplayName(collection: PressedCollection): PressedCollection = {
    collection.targetedTerritory.map { t =>
      collection.copy(
        displayName = s"${collection.displayName} (${prettyTerritoryLookup(t)} ONLY)",
        config = collection.config.copy(displayName = collection.config.displayName.map(dn => s"$dn (${prettyTerritoryLookup(t)} ONLY)")))
    }.getOrElse(collection)
  }

  def markCollections(faciaPage: PressedPage): PressedPage = {
    faciaPage.copy(collections = faciaPage.collections.map(markDisplayName))
  }

  def pageContainsTargetedCollections(faciaPage: PressedPage): Boolean =
    faciaPage.collections.exists(c => c.targetedTerritory.isDefined)

  def processTargetedCollections(faciaPage: PressedPage, allowedContainerTerritories: List[TargetedTerritory], isPreview: Boolean): PressedPage = {
    if (pageContainsTargetedCollections(faciaPage)) {
      if (isPreview) {
        markCollections(faciaPage)
      } else {
        filterCollections(faciaPage, allowedContainerTerritories)
      }
    } else faciaPage
  }
}
