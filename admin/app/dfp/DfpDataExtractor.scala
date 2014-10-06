package dfp

case class DfpDataExtractor(lineItems: Seq[GuLineItem]) {

  val isValid = lineItems.nonEmpty

  def sectionsFromAdUnits(adUnits: Seq[GuAdUnit]): Seq[String] = adUnits map (_.path.drop(1).head)

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
      val paths = lineItem.targeting.adUnits map { adUnit =>
        adUnit.path mkString "/"
      }
      val countries = countriesTargeted(lineItem)
      val isR2Only = lineItem.targeting.targetsR2Only
      val targetsAdTest = lineItem.targeting.hasAdTestTargetting
      PageSkinSponsorship(lineItem.name, lineItem.id, paths, countries, isR2Only, targetsAdTest)
    }
  }

  def countriesTargeted(lineItem: GuLineItem): Seq[Country] = {
    lineItem.targeting.geoTargetsIncluded map (geoTarget => Country.fromName(geoTarget.name))
  }

  def locationsTargeted(lineItem: GuLineItem): Seq[String] = {

    def descriptions(geoTargets: Seq[GeoTarget])(description: GeoTarget => String): Seq[String] = {
      geoTargets.sortBy(_.name) map description
    }

    val targeting = lineItem.targeting
    descriptions(targeting.geoTargetsIncluded)(_.name) ++ descriptions(targeting.geoTargetsExcluded)(target => s"excluding ${target.name}")
  }

}
