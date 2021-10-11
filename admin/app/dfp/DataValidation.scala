package dfp

import com.google.api.ads.admanager.axis.v202108._
import common.dfp._
import dfp.ApiHelper.toSeq

class DataValidation(adUnitService: AdUnitService) {

  def isGuLineItemValid(guLineItem: GuLineItem, dfpLineItem: LineItem): Boolean = {

    // Check that all the direct dfp ad units have been accounted for in the targeting.
    val guAdUnits = guLineItem.targeting.adUnitsIncluded

    val dfpAdUnitIds = Option(dfpLineItem.getTargeting.getInventoryTargeting)
      .map(inventoryTargeting => toSeq(inventoryTargeting.getTargetedAdUnits).map(_.getAdUnitId()))
      .getOrElse(Nil)

    // The validation should not account for inactive or archived ad units.
    val activeDfpAdUnitIds = dfpAdUnitIds.filterNot { adUnitId =>
      adUnitService.isArchivedAdUnit(adUnitId) || adUnitService.isInactiveAdUnit(adUnitId)
    }

    activeDfpAdUnitIds.forall(adUnitId => {
      guAdUnits.exists(_.id == adUnitId)
    })
  }
}
