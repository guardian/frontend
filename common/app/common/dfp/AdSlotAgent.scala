package common.dfp

import java.net.URI

import common.Edition
import conf.Configuration.commercial.dfpAdUnitRoot

trait AdSlotAgent {

  protected val isProd: Boolean

  protected def lineItems: Seq[GuLineItem]

  protected def takeoversWithEmptyMPUs: Seq[TakeoverWithEmptyMPUs]

  private def fullAdUnit(adUnitWithoutRoot: String) = s"$dfpAdUnitRoot/$adUnitWithoutRoot"

  def hasAdInTopBelowNavSlot(adUnitWithoutRoot: String, edition: Edition): Boolean = {

    def isCurrent(lineItem: GuLineItem) = {
      lineItem.startTime.isBeforeNow && (
        lineItem.endTime.isEmpty || lineItem.endTime.exists(_.isAfterNow)
        )
    }

    def targetsTopBelowNavSlot(lineItem: GuLineItem) = {
      lineItem.targeting.customTargetSets exists { targetSet =>
        targetSet.targets exists (_.isSlot("top-below-nav"))
      }
    }

    def targetsEdition(lineItem: GuLineItem) = {
      val editions = lineItem.targeting.editions
      editions.isEmpty || editions.contains(edition)
    }

    def targetsAdUnit(lineItem: GuLineItem) = {
      val adUnits = for (adUnit <- lineItem.targeting.adUnits) yield {
        adUnit.path.mkString("/").stripSuffix("/ng")
      }
      adUnits.contains(fullAdUnit(adUnitWithoutRoot))
    }

    def targetsAdTest(lineItem: GuLineItem) = lineItem.targeting.hasAdTestTargetting

    val isFront = adUnitWithoutRoot.endsWith("/front") || adUnitWithoutRoot.endsWith("/front/ng")

    isFront && lineItems.exists { lineItem =>
      isCurrent(lineItem) &&
        targetsTopBelowNavSlot(lineItem) &&
        targetsEdition(lineItem) &&
        targetsAdUnit(lineItem) &&
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
