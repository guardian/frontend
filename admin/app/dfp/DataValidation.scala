package dfp

import com.google.api.ads.dfp.axis.v201508._
import common.dfp._
object DataValidation {

  def isGuLineItemValid(guLineItem: GuLineItem, dfpLineItem: LineItem): Boolean = {

    // Check that all the direct dfp ad units have been accounted for in the targeting.
    val guAdUnits = guLineItem.targeting.adUnits

    val dfpAdUnitIds = dfpLineItem.getTargeting.getInventoryTargeting.getTargetedAdUnits.toSeq.map(_.getAdUnitId())

    dfpAdUnitIds.forall( adUnitId => {
      guAdUnits.exists(_.id == adUnitId)
    })
  }
}