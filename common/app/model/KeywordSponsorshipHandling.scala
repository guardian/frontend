package model

import common.Edition
import common.dfp.DfpAgent

case class KeywordSponsorshipHandling(
  id: String,
  adUnitSuffix: String,
  keywordIds: Seq[String]) {

  def isSponsored(maybeEdition: Option[Edition]): Boolean =
    keywordIds exists (DfpAgent.isSponsored(_, Some(id), maybeEdition))

  val hasMultipleSponsors: Boolean = keywordIds exists {
    DfpAgent.hasMultipleSponsors
  }

  val isAdvertisementFeature: Boolean = keywordIds exists {
    DfpAgent.isAdvertisementFeature(_, Some(id))
  }

  val hasMultipleFeatureAdvertisers: Boolean = keywordIds exists {
    DfpAgent.hasMultipleFeatureAdvertisers
  }

  val isFoundationSupported: Boolean = keywordIds exists {
    DfpAgent.isFoundationSupported(_, Some(id))
  }

  val sponsor: Option[String] = keywordIds.flatMap(DfpAgent.getSponsor(_)).headOption

  def hasPageSkin(edition: Edition): Boolean = DfpAgent.isPageSkinned(adUnitSuffix, edition)
}
