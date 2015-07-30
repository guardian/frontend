package common.dfp

import java.net.URI

import common.Edition
import common.dfp.AdSize.{leaderboardSize, responsiveSize}
import common.editions.{Au, Uk, Us}
import conf.Configuration.commercial.dfpAdUnitRoot

trait AdSlotAgent {

  protected val isProd: Boolean

  protected def lineItemsBySlot: Map[AdSlot, Seq[GuLineItem]]

  protected def takeoversWithEmptyMPUs: Seq[TakeoverWithEmptyMPUs]

  private def fullAdUnit(adUnitWithoutRoot: String) = s"$dfpAdUnitRoot/$adUnitWithoutRoot"

  private def isCurrent(lineItem: GuLineItem) = {
    lineItem.startTime.isBeforeNow && (
      lineItem.endTime.isEmpty || lineItem.endTime.exists(_.isAfterNow)
      )
  }

  private def targetsAdUnit(lineItem: GuLineItem, adUnitWithoutRoot: String) = {
    val adUnits = for (adUnit <- lineItem.targeting.adUnits) yield {
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

    def deriveEditionFromGeotargeting(lineItem: GuLineItem): Option[Edition] = {
      lineItem.targeting.geoTargetsIncluded.headOption flatMap {
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
        !(isProd && targetsAdTest(lineItem))
    }

    lineItems flatMap (_.creativeSizes)
  }

  def hasAdInTopBelowNavSlot(adUnitWithoutRoot: String, edition: Edition): Boolean = {

    def targetsTopBelowNavSlot(lineItem: GuLineItem) = {
      lineItem.targeting.customTargetSets exists { targetSet =>
        targetSet.targets exists (_.isSlot("top-below-nav"))
      }
    }

    def targetsEdition(lineItem: GuLineItem, edition: Edition) = {
      val editions = lineItem.targeting.editions
      editions.isEmpty || editions.contains(edition)
    }

    val isFront = adUnitWithoutRoot.endsWith("/front") || adUnitWithoutRoot.endsWith("/front/ng")

    isFront && lineItemsBySlot.getOrElse(TopBelowNavSlot, Nil).exists { lineItem =>
      isCurrent(lineItem) &&
        targetsTopBelowNavSlot(lineItem) &&
        targetsEdition(lineItem, edition) &&
        targetsAdUnit(lineItem, adUnitWithoutRoot) &&
        !(isProd && targetsAdTest(lineItem))
    }
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

case object TopBelowNavSlot extends AdSlot("top-below-nav")

case object TopSlot extends AdSlot("top")
