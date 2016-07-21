package common.dfp

import java.net.URI

import common.Edition
import common.dfp.AdSize.{leaderboardSize, responsiveSize}
import common.editions.{Au, Uk, Us}
import conf.Configuration.commercial.dfpAdUnitGuRoot

trait AdSlotAgent {

  protected def environmentIsProd: Boolean

  protected def lineItemsBySlot: Map[AdSlot, Seq[GuLineItem]]

  protected def takeoversWithEmptyMPUs: Seq[TakeoverWithEmptyMPUs]

  private def fullAdUnit(adUnitWithoutRoot: String) = s"$dfpAdUnitGuRoot/$adUnitWithoutRoot"

  private def isCurrent(lineItem: GuLineItem) = {
    lineItem.startTime.isBeforeNow && (
      lineItem.endTime.isEmpty || lineItem.endTime.exists(_.isAfterNow)
      )
  }

  private def targetsAdUnit(lineItem: GuLineItem, adUnitWithoutRoot: String) = {
    val adUnits = for (adUnit <- lineItem.targeting.adUnitsIncluded) yield {
      adUnit.path.mkString("/").stripSuffix("/ng")
    }
    adUnits.contains(fullAdUnit(adUnitWithoutRoot))
  }

  private def targetsAdTest(lineItem: GuLineItem) = lineItem.targeting.hasAdTestTargetting

  def sizeOfTakeoverAdsInSlot(slot: AdSlot,
                              adUnitWithoutRoot: String,
                              edition: Edition): Seq[AdSize] = {

    def targetsRelevantSizes(lineItem: GuLineItem): Boolean = {
      val creativeSizes = lineItem.creativeSizes
      creativeSizes.contains(leaderboardSize) || creativeSizes.contains(responsiveSize)
    }

    def deriveEditionFromGeotargeting(lineItem: GuLineItem): Seq[Edition] = {
      lineItem.targeting.geoTargetsIncluded flatMap {
        case GeoTarget(_, _, "COUNTRY", "United Kingdom") => Some(Uk)
        case GeoTarget(_, _, "COUNTRY", "United States") => Some(Us)
        case GeoTarget(_, _, "COUNTRY", "Australia") => Some(Au)
        case _ => None
      }
    }

    val lineItems = lineItemsBySlot.getOrElse(slot, Nil).filter { lineItem =>
      isCurrent(lineItem) &&
        lineItem.costType == "CPD" &&
        targetsRelevantSizes(lineItem) &&
        targetsAdUnit(lineItem, adUnitWithoutRoot) &&
        deriveEditionFromGeotargeting(lineItem).contains(edition) &&
        !(environmentIsProd && targetsAdTest(lineItem))
    }

    lineItems flatMap (_.creativeSizes)
  }

  def omitMPUsFromContainers(pageId: String, edition: Edition): Boolean = {

    def toPageId(url: String): String = new URI(url).getPath.tail

    val current = takeoversWithEmptyMPUs filter { takeover =>
      takeover.startTime.isBeforeNow && takeover.endTime.isAfterNow
    }

    current exists { takeover =>
      toPageId(takeover.url) == pageId && takeover.editions.contains(edition)
    }
  }
}


sealed abstract class AdSlot(val name: String)

case object TopAboveNavSlot extends AdSlot("top-above-nav")
