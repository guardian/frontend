package dfp

import com.google.api.ads.dfp.axis.v201608._
import common.dfp._
import dfp.ApiHelper.toSeq

object DataValidation {

  def isGuLineItemValid(guLineItem: GuLineItem, dfpLineItem: LineItem): Boolean = {

    // Check that all the direct dfp ad units have been accounted for in the targeting.
    val guAdUnits = guLineItem.targeting.adUnitsIncluded

    val dfpAdUnitIds = Option(dfpLineItem.getTargeting.getInventoryTargeting)
      .map( inventoryTargeting =>
        toSeq(inventoryTargeting.getTargetedAdUnits).map(_.getAdUnitId()
      )).getOrElse(Nil)

    // The validation should not account for inactive or archived ad units.
    val activeDfpAdUnitIds = dfpAdUnitIds.filterNot { adUnitId =>
      AdUnitService.isArchivedAdUnit(adUnitId) || AdUnitService.isInactiveAdUnit(adUnitId)
    }

    activeDfpAdUnitIds.forall( adUnitId => {
      guAdUnits.exists(_.id == adUnitId)
    })
  }
}
