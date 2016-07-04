package common.commercial.hosted

import model.StandalonePage

trait HostedPage extends StandalonePage {

  def pageUrl: String
  def pageName: String
  def pageTitle: String
  def standfirst: String
  def logoUrl: String
}

object HostedPage {

  private val renaultCampaignName = "renault-car-of-the-future"
  private val galleryTestCampaignName = "hosted-gallery"
  private val visitBritainCampaignName = "visit-britain"

  def fromPageName(campaignName: String, pageName: String): Option[HostedPage] = {
    campaignName match {
      case `renaultCampaignName` => RenaultHostedPages.fromPageName(pageName)
      case `galleryTestCampaignName` => HostedGalleryTestPage.fromPageName(pageName)
      case `visitBritainCampaignName` => VisitBritainHostedPages.fromPageName(pageName)
      case _ => None;
    }
  }
}
