package dfp

import common.Edition
import common.dfp._

case class DfpDataExtractor(lineItems: Seq[GuLineItem], invalidLineItems: Seq[GuLineItem]) {

  val hasValidLineItems: Boolean = lineItems.nonEmpty

  val inlineMerchandisingTargetedLineItems: InlineMerchandisingLineItems = {
    val targetedLineItems = lineItems
      .filter(_.targetsInlineMerchandising)
      .foldLeft(Seq.empty[InlineMerchandisingLineItem]) { (soFar, lineItem) =>
        soFar :+ InlineMerchandisingLineItem(
          name = lineItem.name,
          id = lineItem.id,
          keywords = lineItem.inlineMerchandisingTargetedKeywords,
          series = lineItem.inlineMerchandisingTargetedSeries,
          contributors = lineItem.inlineMerchandisingTargetedContributors,
        )
      }

    InlineMerchandisingLineItems(items = targetedLineItems)
  }

  val inlineMerchandisingTargetedTags: InlineMerchandisingTagSet = {
    lineItems.foldLeft(InlineMerchandisingTagSet()) { (soFar, lineItem) =>
      soFar.copy(
        keywords = soFar.keywords ++ lineItem.inlineMerchandisingTargetedKeywords,
        series = soFar.series ++ lineItem.inlineMerchandisingTargetedSeries,
        contributors = soFar.contributors ++ lineItem.inlineMerchandisingTargetedContributors,
      )
    }
  }

  val liveBlogTopTargetedLineItems: LiveblogTopLineItems = {
    val targetedLineItems = lineItems
      .filter(_.targetsLiveBlogTop)
      .foldLeft(Seq.empty[LiveblogTopLineItem]) { (soFar, lineItem) =>
        soFar :+ LiveblogTopLineItem(
          name = lineItem.name,
          id = lineItem.id,
          targetedSections = lineItem.liveBlogTopTargetedSections,
          targetedContentTypes = lineItem.liveBlogTopTargetedContentTypes,
        )
      }
  }

  val liveBlogTopTargetedSections: Set[String] = {
    lineItems.foldLeft(Set.empty[String]) { (soFar, lineItem) =>
      soFar ++ lineItem.liveBlogTopTargetedSections
    }
  }

  val liveBlogTopTargetedContentTypes: Set[String] = {
    lineItems.foldLeft(Set.empty[String]) { (soFar, lineItem) =>
      soFar ++ lineItem.liveBlogTopTargetedContentTypes
    }
  }

  val targetedHighMerchandisingLineItems: HighMerchandisingLineItems = {
    val highMerchLineItems = lineItems
      .filter(_.targetsHighMerchandising)
      .foldLeft(Seq.empty[HighMerchandisingLineItem]) { (soFar, lineItem) =>
        soFar :+ HighMerchandisingLineItem(
          name = lineItem.name,
          id = lineItem.id,
          tags = lineItem.highMerchandisingTargets,
          adUnitsIncluded = lineItem.targeting.adUnitsIncluded,
          adUnitsExcluded = lineItem.targeting.adUnitsExcluded,
          customTargetSet = lineItem.targeting.customTargetSets,
        )
      }

    HighMerchandisingLineItems(items = highMerchLineItems)
  }

  val pageSkinSponsorships: Seq[PageSkinSponsorship] = {
    lineItems withFilter { lineItem =>
      lineItem.isPageSkin && lineItem.isCurrent
    } map { lineItem =>
      PageSkinSponsorship(
        lineItemName = lineItem.name,
        lineItemId = lineItem.id,
        adUnits = lineItem.targeting.adUnitsIncluded map (_.path mkString "/"),
        editions = editionsTargeted(lineItem),
        countries = countriesTargeted(lineItem),
        targetsAdTest = lineItem.targeting.hasAdTestTargetting,
        adTestValue = lineItem.targeting.adTestValue,
        keywords = lineItem.targeting.keywordValues,
        series = lineItem.targeting.serieValues,
      )
    }
  }

  def dateSort(lineItems: => Seq[GuLineItem]): Seq[GuLineItem] =
    lineItems sortBy { lineItem =>
      (lineItem.startTime.getMillis, lineItem.endTime.map(_.getMillis).getOrElse(0L))
    }

  val topAboveNavSlotTakeovers: Seq[GuLineItem] = dateSort {
    lineItems filter (_.isSuitableForTopAboveNavSlot)
  }

  def editionsTargeted(lineItem: GuLineItem): Seq[Edition] = {
    for {
      targetSet <- lineItem.targeting.customTargetSets
      target <- targetSet.targets
      if target.isEditionTag
      value <- target.values
      edition <- Edition.byId(value)
    } yield edition
  }

  def countriesTargeted(lineItem: GuLineItem): Seq[String] = {
    lineItem.targeting.geoTargetsIncluded map (_.name)
  }

  def locationsTargeted(lineItem: GuLineItem): Seq[String] = {

    def descriptions(geoTargets: Seq[GeoTarget])(description: GeoTarget => String): Seq[String] = {
      geoTargets.sortBy(_.name) map description
    }

    val targeting = lineItem.targeting
    descriptions(targeting.geoTargetsIncluded)(_.name) ++ descriptions(targeting.geoTargetsExcluded)(target =>
      s"excluding ${target.name}",
    )
  }

}
