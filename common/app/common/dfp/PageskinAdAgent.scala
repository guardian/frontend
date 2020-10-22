package common.dfp

import com.gu.commercial.display.AdTargetParam.toMap
import com.gu.commercial.display.{AdTargetParamValue, MultipleValues}
import common.Edition
import model.MetaData

trait PageskinAdAgent {

  protected val environmentIsProd: Boolean

  protected def pageSkinSponsorships: Seq[PageSkinSponsorship]

  // There are two forms of pageskins:
  // - pageskins that target through ad unit (for pressed fronts)
  // - pageskins that target through a keyword (for index page fronts)
  private[dfp] def findSponsorships(
      adUnitPath: String,
      metaData: MetaData,
      edition: Edition,
  ): Seq[PageSkinSponsorship] = {

    println("*********** findSponsorships");

    val nextGenSuffix = "/ng"

    def containsAdUnit(adUnits: Seq[String], adUnit: String): Boolean =
      adUnits
        .map { _.stripSuffix(nextGenSuffix) }
        .exists { adUnitPath.stripSuffix(nextGenSuffix).endsWith }

    def hasMatchingAdUnit(sponsorship: PageSkinSponsorship): Boolean =
      containsAdUnit(sponsorship.adUnits, adUnitPath)

    val candidates = pageSkinSponsorships filter { sponsorship =>
      sponsorship.editions.contains(edition)
    }

    println("*********** ALL CANDIDATES", candidates);
    println("*********** adUnitPath", adUnitPath);

    if (PageSkin.isValidAdUnit(adUnitPath)) {
      candidates filter hasMatchingAdUnit
      println("*********** HAS MATCHING UNIT CANDIDATES", candidates);
      candidates
    } else {
      val targetingMap = toMap(metaData.commercial.map(_.adTargeting(edition)).getOrElse(Set.empty))

      val targetingMapValues = (map: Map[String, AdTargetParamValue], key: String) =>
        map.get(key) match {
          case Some(values: MultipleValues) => values.values.toSeq
          case _                            => Seq.empty
        }

      val keywordTargeting = targetingMapValues(targetingMap, "k")
      val seriesTargeting = targetingMapValues(targetingMap, "se")

      candidates filter { sponsorship =>
        sponsorship.keywords.intersect(keywordTargeting).nonEmpty ||
        sponsorship.series.intersect(seriesTargeting).nonEmpty
      }

      println("*********** PAGESKIN CANDIDATES");
      println(candidates);

      candidates
    }
  }

  // The ad unit is considered to have a page skin if it has a corresponding sponsorship.
  def hasPageSkin(fullAdUnitPath: String, metaData: MetaData, edition: Edition): Boolean = {
    if (metaData.isFront) {
      findSponsorships(fullAdUnitPath, metaData, edition).nonEmpty
    } else false
  }

  // True if there is any candidate sponsorship for this ad unit. Used to decide when to render the out-of-page ad slot.
  def hasPageSkinOrAdTestPageSkin(fullAdUnitPath: String, metaData: MetaData, edition: Edition): Boolean = {
    if (metaData.isFront) {
      findSponsorships(fullAdUnitPath, metaData, edition).nonEmpty
    } else false
  }
}
