package common.dfp

import common.Edition
import conf.Configuration.commercial._

trait PageskinAdAgent {

  protected val isProd: Boolean

  protected def pageSkinSponsorships: Seq[PageSkinSponsorship]

  def isPageSkinned(adUnitWithoutRoot: String, edition: Edition): Boolean = {
    if (PageSkin.isValidForNextGenPageSkin(adUnitWithoutRoot)) {
      val adUnitWithRoot = s"$dfpAdUnitRoot/$adUnitWithoutRoot"

      def targetsAdUnitAndMatchesTheEdition(sponsorship: PageSkinSponsorship) = {
        val adUnits = sponsorship.adUnits map (_.stripSuffix("/ng"))
        adUnits.contains(adUnitWithRoot) &&
          sponsorship.editions.contains(edition) &&
          !sponsorship.isR2Only
      }

      pageSkinSponsorships.exists { sponsorship =>
        val isPageTargeted = targetsAdUnitAndMatchesTheEdition(sponsorship)
        isPageTargeted && (!isProd || !sponsorship.targetsAdTest)
      }

    } else false
  }
}
