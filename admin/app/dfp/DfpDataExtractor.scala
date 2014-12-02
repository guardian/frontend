package dfp

import common.Edition
import dfp.Sponsorship.ANY_SECTION

case class DfpDataExtractor(lineItems: Seq[GuLineItem]) {

  val isValid = lineItems.nonEmpty

  def sectionsFromAdUnits(adUnits: Seq[GuAdUnit]): Seq[String] = {
    adUnits map {
      _.path.drop(1).headOption getOrElse {
        /*
         if a line item targets the site root ad unit
         then a corresponding sponsorship will target any section of the site
         */
        ANY_SECTION
      }
    }
  }

  val sponsorships: Seq[Sponsorship] = {
    lineItems.withFilter { lineItem =>
      lineItem.sponsoredTags.nonEmpty && lineItem.isCurrent
    }.map { lineItem =>
      Sponsorship(
        tags = lineItem.sponsoredTags,
        sections = sectionsFromAdUnits(lineItem.targeting.adUnits),
        sponsor = lineItem.sponsor,
        countries = locationsTargeted(lineItem),
        lineItemId = lineItem.id)
    }.distinct
  }

  val advertisementFeatureSponsorships: Seq[Sponsorship] = {
    lineItems.withFilter { lineItem =>
      lineItem.advertisementFeatureTags.nonEmpty && lineItem.isCurrent
    }.map { lineItem =>
      Sponsorship(
        tags = lineItem.advertisementFeatureTags,
        sections = sectionsFromAdUnits(lineItem.targeting.adUnits),
        sponsor = lineItem.sponsor,
        countries = locationsTargeted(lineItem),
        lineItemId = lineItem.id)
    }.distinct
  }

  val inlineMerchandisingTargetedTags: InlineMerchandisingTagSet = {
    lineItems.foldLeft(InlineMerchandisingTagSet()) { (soFar, lineItem) =>
      soFar.copy(keywords = soFar.keywords ++ lineItem.inlineMerchandisingTargetedKeywords,
        series = soFar.series ++ lineItem.inlineMerchandisingTargetedSeries,
        contributors = soFar.contributors ++ lineItem.inlineMerchandisingTargetedContributors)
    }
  }

  val foundationSupported: Seq[Sponsorship] = {
    lineItems.withFilter { lineItem =>
      lineItem.foundationSupportedTags.nonEmpty && lineItem.isCurrent
    }.map { lineItem =>
      Sponsorship(
        tags = lineItem.foundationSupportedTags,
        sections = sectionsFromAdUnits(lineItem.targeting.adUnits),
        sponsor = lineItem.sponsor,
        countries = locationsTargeted(lineItem),
        lineItemId = lineItem.id)
    }.distinct
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
