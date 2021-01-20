package views.commercial

import common.dfp.{GuAdUnit, GuLineItem}

object LineItemSupport {

  def targetedAdUnits(lineItem: GuLineItem): Seq[String] = {
    def mkString(adUnit: GuAdUnit): String = adUnit.path.mkString("/")
    val lineItemAdUnits = for {
      adUnit <- lineItem.targeting.adUnitsIncluded
    } yield mkString(adUnit)
    val creativeAdUnits = for {
      placeholder <- lineItem.creativePlaceholders
      targeting <- placeholder.targeting
    } yield {
      for (adUnit <- targeting.adUnitsIncluded) yield mkString(adUnit)
    }
    (lineItemAdUnits ++ creativeAdUnits.flatten).sorted.distinct
  }
}
