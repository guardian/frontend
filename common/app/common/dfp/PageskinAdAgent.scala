package common.dfp

import common.Edition
import conf.Configuration.commercial._

trait PageskinAdAgent {

  protected val environmentIsProd: Boolean

  protected def pageSkinSponsorships: Seq[PageSkinSponsorship]

  private def findSponsorships(adUnitWithoutRoot: String, edition: Edition): Seq[PageSkinSponsorship] = {

    if (PageSkin.isValidAdUnit(adUnitWithoutRoot)) {
      val adUnitWithRoot = s"$dfpAdUnitRoot/$adUnitWithoutRoot"

      def targetsAdUnitAndMatchesTheEdition(sponsorship: PageSkinSponsorship) = {
        val adUnits = sponsorship.adUnits map (_.stripSuffix("/ng"))
        adUnits.contains(adUnitWithRoot) &&
          sponsorship.editions.contains(edition) &&
          !sponsorship.isR2Only
      }

      pageSkinSponsorships filter { sponsorship =>
        targetsAdUnitAndMatchesTheEdition(sponsorship)
      }
    } else {
      Seq.empty
    }
  }

  // The ad unit is considered to have a page skin if it has a corresponding sponsorship.
  // If the sponsorship is an adTest, it is only considered outside of production.
  def hasPageSkin(adUnitWithoutRoot: String, edition: Edition): Boolean = {
    true
//    findSponsorships(adUnitWithoutRoot, edition) exists (sponsorship => !(environmentIsProd && sponsorship.targetsAdTest))
  }

  // True if there is any candidate sponsorship for this ad unit. Used to decide when to render the out-of-page ad slot.
  def hasPageSkinOrAdTestPageSkin(adUnitWithoutRoot: String, edition: Edition): Boolean = {
    true
//    findSponsorships(adUnitWithoutRoot, edition).nonEmpty
  }
}
