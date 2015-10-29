package dfp

import common.Edition
import common.dfp.AdSize.responsiveSize
import common.dfp.{GeoTarget, GuLineItem, InlineMerchandisingTagSet, PageSkinSponsorship}
import org.joda.time.DateTime

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
    lineItems filter {
      _.targeting.customTargetSets.exists(_.targets.exists(_.isSlot("top-below-nav")))
    }
  }

  val topSlotTakeovers = dateSort {
    lineItems filter { lineItem =>
      lineItem.costType == "CPD" &&
        lineItem.targetsNetworkOrSectionFrontDirectly &&
        lineItem.targeting.geoTargetsIncluded.exists { geoTarget =>
          geoTarget.locationType == "COUNTRY" && (
            geoTarget.name == "United Kingdom" ||
              geoTarget.name == "United States" ||
              geoTarget.name == "Australia"
            )
        } &&
        lineItem.creativeSizes.contains(responsiveSize) &&
        lineItem.startTime.isBefore(DateTime.now.plusDays(1)) &&
        lineItem.endTime.isDefined
    }
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
