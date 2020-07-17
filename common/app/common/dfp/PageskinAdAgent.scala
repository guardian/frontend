package common.dfp

import com.gu.commercial.display.AdTargetParam.toMap
import com.gu.commercial.display.{AdTargetParamValue, MultipleValues}
import common.Edition
import model.MetaData
import org.slf4j.LoggerFactory
import play.api.mvc.RequestHeader

trait PageskinAdAgent {

  protected val environmentIsProd: Boolean

  protected def pageSkinSponsorships: Seq[PageSkinSponsorship]

  // There are two forms of pageskins:
  // - pageskins that target through ad unit (for pressed fronts)
  // - pageskins that target through a keyword (for index page fronts)
  private[dfp] def findSponsorships(
    adUnitPath: String,
    metaData: MetaData,
    edition: Edition
  ): Seq[PageSkinSponsorship] = {

    val nextGenSuffix = "/ng"

    def containsAdUnit(adUnits: Seq[String], adUnit: String): Boolean =
      adUnits.map { _.stripSuffix(nextGenSuffix) }
      .exists { adUnitPath.stripSuffix(nextGenSuffix).endsWith }

    def hasMatchingAdUnit(sponsorship: PageSkinSponsorship): Boolean =
      containsAdUnit(sponsorship.adUnits, adUnitPath)

    val candidates = pageSkinSponsorships filter { sponsorship =>
      sponsorship.editions.contains(edition)
    }

    if (PageSkin.isValidAdUnit(adUnitPath)) {
      candidates filter hasMatchingAdUnit
    } else {
      val targetingMap = toMap(metaData.commercial.map(_.adTargeting(edition)).getOrElse(Set.empty))

      val targetingMapValues = (map: Map[String, AdTargetParamValue], key: String) =>
        map.get(key) match {
          case Some(values: MultipleValues) => values.values.toSeq
          case _                            => Seq.empty
      }

      val keywordTargeting = targetingMapValues(targetingMap, "k")
      val seriesTargeting  = targetingMapValues(targetingMap, "se")

      candidates filter { sponsorship =>
        sponsorship.keywords.intersect(keywordTargeting).nonEmpty ||
        sponsorship.series.intersect(seriesTargeting).nonEmpty
      }
    }
  }

  // The ad unit is considered to have a page skin if it has a corresponding sponsorship.
  // If the sponsorship is targetting an adtest we also consider that the request URL includes the same adtest param
  def hasPageSkin(fullAdUnitPath: String, metaData: MetaData, edition: Edition, request: RequestHeader): Boolean = {
    val logger = LoggerFactory.getLogger(this.getClass)
    logger.info("*** Is Front ", metaData.isFront)
    if (metaData.isFront) {
      val adTestParam = request.getQueryString("adtest")
      logger.info("*** adTestParam ", adTestParam)
      val shouldShow = findSponsorships(fullAdUnitPath, metaData, edition) exists (sponsorship =>
        if (sponsorship.targetsAdTest) {
          logger.info("*** sponsorship.targetsAdTest", sponsorship.targetsAdTest)
          logger.info("*** sponsorship", sponsorship)
          sponsorship.adTestValue == adTestParam
        } else {
          logger.info("*** SPONSORSHIP DOESNT TARGET TEST")
          logger.info("*** sponsorship", sponsorship)
          true
        })
      logger.info("*** SHOULD SHOW", shouldShow)
      shouldShow
    } else false
  }
}
