package model

import common.Edition
import dfp.DfpAgent

trait KeywordSponsorshipHandling { self: AdSuffixHandlingForFronts =>
  val keywordIds: Seq[String]

  override def isSponsored(maybeEdition: Option[Edition]): Boolean =
    keywordIds exists (DfpAgent.isSponsored(_, Some(id), maybeEdition))

  override lazy val hasMultipleSponsors: Boolean = keywordIds exists {
    DfpAgent.hasMultipleSponsors
  }

  override def isAdvertisementFeature(maybeEdition: Option[Edition]): Boolean = keywordIds exists {
    DfpAgent.isAdvertisementFeature(_, Some(id), maybeEdition)
  }

  override lazy val hasMultipleFeatureAdvertisers: Boolean = keywordIds exists {
    DfpAgent.hasMultipleFeatureAdvertisers
  }

  override def isFoundationSupported(maybeEdition: Option[Edition]): Boolean = keywordIds exists {
    DfpAgent.isFoundationSupported(_, Some(id), maybeEdition)
  }

  override lazy val sponsor: Option[String] = keywordIds.flatMap(DfpAgent.getSponsor(_)).headOption

  override def hasPageSkin(edition: Edition): Boolean = DfpAgent.isPageSkinned(adUnitSuffix, edition)
}
