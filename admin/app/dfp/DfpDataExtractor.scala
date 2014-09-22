package dfp

case class DfpDataExtractor(lineItems: Seq[GuLineItem]) {

  val isValid = lineItems.nonEmpty

  val sponsorships: Seq[Sponsorship] = {
    lineItems.withFilter { lineItem =>
      lineItem.sponsoredTags.nonEmpty && lineItem.isCurrent
    }.map { lineItem =>
      Sponsorship(lineItem.sponsoredTags, lineItem.sponsor, countryNamesTargeted(lineItem), lineItem.id)
    }.distinct
  }

  val advertisementFeatureSponsorships: Seq[Sponsorship] = {
    lineItems.withFilter { lineItem =>
      lineItem.advertisementFeatureTags.nonEmpty && lineItem.isCurrent
    }.map { lineItem =>
      Sponsorship(lineItem.advertisementFeatureTags, lineItem.sponsor, countryNamesTargeted(lineItem), lineItem.id)
    }.distinct
  }

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
    lineItem.targeting.geoTargets map (geoTarget => Country.fromName(geoTarget.name))
  }

  def countryNamesTargeted(lineItem: GuLineItem): Seq[String] = {
    countriesTargeted(lineItem).map(_.name).sorted
  }

}
