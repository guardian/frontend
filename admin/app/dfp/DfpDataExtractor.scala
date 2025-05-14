package dfp

import common.Edition
import common.dfp._

case class DfpDataExtractor(lineItems: Seq[GuLineItem], invalidLineItems: Seq[GuLineItem]) {

  val hasValidLineItems: Boolean = lineItems.nonEmpty

  val liveBlogTopSponsorships: Seq[LiveBlogTopSponsorship] = {
    lineItems
      .filter(lineItem => lineItem.targetsLiveBlogTop && lineItem.isCurrent)
      .foldLeft(Seq.empty[LiveBlogTopSponsorship]) { (soFar, lineItem) =>
        soFar :+ LiveBlogTopSponsorship(
          lineItemName = lineItem.name,
          lineItemId = lineItem.id,
          adTest = lineItem.targeting.adTestValue,
          editions = editionsTargeted(lineItem),
          sections = lineItem.liveBlogTopTargetedSections,
          keywords = lineItem.targeting.keywordValues,
          targetsAdTest = lineItem.targeting.hasAdTestTargeting,
        )
      }
  }

  val surveySponsorships: Seq[SurveySponsorship] = {
    lineItems
      .filter(lineItem => lineItem.targetsSurvey && lineItem.isCurrent)
      .foldLeft(Seq.empty[SurveySponsorship]) { (soFar, lineItem) =>
        soFar :+ SurveySponsorship(
          lineItemName = lineItem.name,
          lineItemId = lineItem.id,
          adUnits = lineItem.targeting.adUnitsIncluded map (_.path mkString "/"),
          countries = countriesTargeted(lineItem),
          adTest = lineItem.targeting.adTestValue,
          targetsAdTest = lineItem.targeting.hasAdTestTargeting,
        )
      }
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
        targetsAdTest = lineItem.targeting.hasAdTestTargeting,
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
