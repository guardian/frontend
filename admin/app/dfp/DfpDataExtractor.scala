package dfp

import common.Edition
import common.dfp.{GeoTarget, GuLineItem, InlineMerchandisingTagSet, PageSkinSponsorship}

case class DfpDataExtractor(lineItems: Seq[GuLineItem]) {

  val isValid = lineItems.nonEmpty

  val inlineMerchandisingTargetedTags: InlineMerchandisingTagSet = {
    lineItems.foldLeft(InlineMerchandisingTagSet()) { (soFar, lineItem) =>
      soFar.copy(keywords = soFar.keywords ++ lineItem.inlineMerchandisingTargetedKeywords,
        series = soFar.series ++ lineItem.inlineMerchandisingTargetedSeries,
        contributors = soFar.contributors ++ lineItem.inlineMerchandisingTargetedContributors)
    }
  }

  val pageSkinSponsorships: Seq[PageSkinSponsorship] = {
    lineItems withFilter { lineItem =>
      lineItem.isPageSkin && lineItem.isCurrent
    } map { lineItem =>
      PageSkinSponsorship(
        lineItemName = lineItem.name,
        lineItemId = lineItem.id,
        adUnits = lineItem.targeting.adUnits map (_.path mkString "/"),
        editions = editionsTargeted(lineItem),
        countries = countriesTargeted(lineItem),
        isR2Only = lineItem.targeting.targetsR2Only,
        targetsAdTest = lineItem.targeting.hasAdTestTargetting
      )
    }
  }

  def dateSort(lineItems: => Seq[GuLineItem]): Seq[GuLineItem] = lineItems sortBy { lineItem =>
    (lineItem.startTime.getMillis, lineItem.endTime.map(_.getMillis).getOrElse(0L))
  }

  val topAboveNavSlotTakeovers: Seq[GuLineItem] = dateSort {
    lineItems filter (_.isSuitableForTopAboveNavSlot)
  }

  val topBelowNavSlotTakeovers: Seq[GuLineItem] = dateSort {
    lineItems filter (_.isSuitableForTopBelowNavSlot)
  }

  val topSlotTakeovers = dateSort {
    lineItems filter (_.isSuitableForTopSlot)
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
    descriptions(targeting.geoTargetsIncluded)(_.name) ++ descriptions(targeting.geoTargetsExcluded)(target => s"excluding ${target.name}")
  }

}
