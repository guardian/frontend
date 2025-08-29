package dfp

import common.Edition
import common.dfp._

case class DfpDataExtractor(lineItems: Seq[GuLineItem], invalidLineItems: Seq[GuLineItem]) {

  val hasValidLineItems: Boolean = lineItems.nonEmpty

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
