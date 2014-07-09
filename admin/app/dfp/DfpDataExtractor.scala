package dfp

case class DfpDataExtractor(lineItems: Seq[GuLineItem]) {

  val isValid = lineItems.nonEmpty

  val sponsorships: Seq[Sponsorship] = {
    lineItems.withFilter { lineItem =>
      lineItem.sponsoredTags.nonEmpty && lineItem.isCurrent
    }.map { lineItem =>
      Sponsorship(lineItem.sponsoredTags, lineItem.sponsor)
    }.distinct
  }

  val advertisementFeatureSponsorships: Seq[Sponsorship] = {
    lineItems.withFilter { lineItem =>
      lineItem.advertisementFeatureTags.nonEmpty && lineItem.isCurrent
    }.map { lineItem =>
      Sponsorship(lineItem.advertisementFeatureTags, lineItem.sponsor)
    }.distinct
  }

  val pageSkinSponsorships: Seq[PageSkinSponsorship] = {
    lineItems withFilter { lineItem =>
      lineItem.isPageSkin && lineItem.isCurrent
    } map { lineItem =>
      val paths = lineItem.targeting.adUnits map { adUnit =>
        adUnit.path mkString "/"
      }
      val countries = lineItem.targeting.geoTargets map (geoTarget => Country.fromName(geoTarget.name))
      PageSkinSponsorship(lineItem.name, lineItem.id, paths, countries)
    }
  }
}
