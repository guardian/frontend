package dfp

import com.google.api.ads.dfp.axis.v201508._
import common.dfp._
import dfp.ApiHelper.toSeq

object DataValidation {

  def isGuLineItemValid(guLineItem: GuLineItem, dfpLineItem: LineItem): Boolean = {

    // Check that all the direct dfp ad units have been accounted for in the targeting.
    val guAdUnits = guLineItem.targeting.adUnits

    val dfpAdUnitIds = Option(dfpLineItem.getTargeting.getInventoryTargeting)
      .map( inventoryTargeting =>
        toSeq(inventoryTargeting.getTargetedAdUnits).map(_.getAdUnitId()
      )).getOrElse(Nil)

    dfpAdUnitIds.forall( adUnitId => {
      guAdUnits.exists(_.id == adUnitId)
    })
  }
}