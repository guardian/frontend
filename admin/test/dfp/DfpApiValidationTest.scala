package dfp

import concurrent.BlockingOperations
import common.dfp.{GuAdUnit, GuLineItem, GuTargeting, Sponsorship}
import com.google.api.ads.admanager.axis.v202502._
import org.joda.time.DateTime
import org.apache.pekko.actor.ActorSystem
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class DfpApiValidationTest extends AnyFlatSpec with Matchers {

  private def lineItem(adUnitIds: Seq[String]): GuLineItem = {
    val adUnits = adUnitIds.map(adUnitId => {
      GuAdUnit(id = adUnitId, path = Nil, status = GuAdUnit.ACTIVE)
    })

    GuLineItem(
      id = 0L,
      orderId = 0L,
      name = "test line item",
      Sponsorship,
      startTime = DateTime.now.withTimeAtStartOfDay,
      endTime = None,
      isPageSkin = false,
      sponsor = None,
      status = "COMPLETED",
      costType = "CPM",
      creativePlaceholders = Nil,
      targeting = GuTargeting(
        adUnitsIncluded = adUnits,
        adUnitsExcluded = Nil,
        geoTargetsIncluded = Nil,
        geoTargetsExcluded = Nil,
        customTargetSets = Nil,
      ),
      lastModified = DateTime.now.withTimeAtStartOfDay,
    )
  }

  private def makeDfpLineItem(adUnitIds: Seq[String]): LineItem = {
    val dfpLineItem = new LineItem()
    val targeting = new Targeting()
    val inventoryTargeting = new InventoryTargeting()

    val adUnitTargeting = adUnitIds.map(adUnit => {
      val adUnitTarget = new AdUnitTargeting()
      adUnitTarget.setAdUnitId(adUnit)
      adUnitTarget
    })

    inventoryTargeting.setTargetedAdUnits(adUnitTargeting.toArray)
    targeting.setInventoryTargeting(inventoryTargeting)
    dfpLineItem.setTargeting(targeting)
    dfpLineItem
  }
}
