package common.commercial.hosted.hardcoded

import common.commercial.hosted.HostedPage

object HostedPages {

  private val renaultCampaignName = "renault-car-of-the-future"
  private val galleryTestCampaignName = "hosted-gallery"
  private val visitBritainCampaignName = "visit-britain"
  private val leffeCampaignName = "TODO"

  def fromPageName(campaignName: String, pageName: String): Option[HostedPage] = {
    campaignName match {
      case `renaultCampaignName` => RenaultHostedPages.fromPageName(pageName)
      case `galleryTestCampaignName` => HostedGalleryTestPage.fromPageName(pageName)
      case `visitBritainCampaignName` => VisitBritainHostedPages.fromPageName(pageName)
      case `leffeCampaignName` => LeffeHostedPages.fromPageName(pageName)
      case _ => None;
    }
  }
}
