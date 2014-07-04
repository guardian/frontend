package dfp

case class DfpDataExtractor(lineItems: Seq[GuLineItem]) {

  val isValid = lineItems.nonEmpty

  val sponsorships: Seq[Sponsorship] = {
    lineItems.withFilter(_.sponsoredTags.nonEmpty).map { lineItem =>
      Sponsorship(lineItem.sponsoredTags, lineItem.sponsor)
    }.distinct
  }

  val advertisementFeatureSponsorships: Seq[Sponsorship] = {
    lineItems.withFilter(_.advertisementFeatureTags.nonEmpty).map { lineItem =>
      Sponsorship(lineItem.advertisementFeatureTags, lineItem.sponsor)
    }.distinct
  }

  val pageSkinSponsorships: Seq[PageSkinSponsorship] = {
    lineItems withFilter (_.isPageSkin) map { lineItem =>
      val paths = lineItem.targeting.adUnits map { adUnit =>
        adUnit.path mkString "/"
      }
      PageSkinSponsorship(lineItem.name, lineItem.id, paths)
    }
  }
}
