package model

import common.Edition
import common.dfp.DfpAgent

trait KeywordSponsorshipHandling { self: AdSuffixHandlingForFronts =>
  val keywordIds: Seq[String]

  override def isSponsored(maybeEdition: Option[Edition]): Boolean =
    keywordIds exists (DfpAgent.isSponsored(_, Some(id), maybeEdition))

  override lazy val hasMultipleSponsors: Boolean = keywordIds exists {
    DfpAgent.hasMultipleSponsors
  }

  override lazy val isAdvertisementFeature: Boolean = keywordIds exists {
    DfpAgent.isAdvertisementFeature(_, Some(id))
  }

  override lazy val hasMultipleFeatureAdvertisers: Boolean = keywordIds exists {
    DfpAgent.hasMultipleFeatureAdvertisers
  }

  override lazy val isFoundationSupported: Boolean = keywordIds exists {
    DfpAgent.isFoundationSupported(_, Some(id))
  }

  override lazy val sponsor: Option[String] = keywordIds.flatMap(DfpAgent.getSponsor(_)).headOption

  override def hasPageSkin(edition: Edition): Boolean = DfpAgent.isPageSkinned(adUnitSuffix, edition)
}
