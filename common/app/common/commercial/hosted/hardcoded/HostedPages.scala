package common.commercial.hosted.hardcoded

import common.commercial.hosted.HostedPage

object LegacyHostedPages {

  private val renaultCampaignName = "renault-car-of-the-future"
  private val galleryTestCampaignName = "hosted-gallery"

  def fromCampaignAndPageName(campaignName: String, pageName: String): Option[HostedPage] = {
    campaignName match {
      case `renaultCampaignName` => RenaultHostedPages.fromPageName(pageName)
      case `galleryTestCampaignName` => HostedGalleryTestPage.fromPageName(pageName)
      case _ => None;
    }
  }
}

object HostedPages {

  private val visitBritainCampaignName = "visit-britain"
  private val leffeCampaignName = "leffe-rediscover-time"

  // todo rename
  private val articleCampaignName = "zootropolis-campaign"

  def fromCampaignAndPageName(campaignName: String, pageName: String): Option[HostedPage] = {
    campaignName match {
      case `visitBritainCampaignName` => VisitBritainHostedPages.fromPageName(pageName)
      case `leffeCampaignName` => LeffeHostedPages.fromPageName(pageName)
      case `articleCampaignName` => ZootropolisCampaign.fromPageName(pageName)
      case _ => None;
    }
  }
}
