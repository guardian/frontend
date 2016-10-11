package common.commercial.hosted.hardcoded

import common.commercial.hosted.{HostedContentType, HostedPage}

object LegacyHostedPages {

  private val renaultCampaignName = "renault-car-of-the-future"
  private val galleryTestCampaignName = "hosted-gallery"

  def fromCampaignAndPageName(campaignName: String, pageName: String): Option[HostedPage] = {
    campaignName match {
      case `renaultCampaignName` => RenaultHostedPages.fromPageName(pageName)
      case _ => None;
    }
  }
}

object HostedPages {

  private val visitBritainCampaignName = "visit-britain"
  private val leffeCampaignName = "leffe-rediscover-time"
  private val zootropolisCampaignName = "disney-zootropolis"
  private val singaporeGrandPrixCampaignName = "singapore-grand-prix"
  private val chesterZooCampaignName = "chester-zoo-act-for-wildlife"

  def fromCampaignAndPageName(campaignName: String, pageName: String): Option[HostedPage] = {
    campaignName match {
      case `visitBritainCampaignName` => VisitBritainHostedPages.fromPageName(pageName)
      case `leffeCampaignName` => LeffeHostedPages.fromPageName(pageName)
      case `zootropolisCampaignName` => ZootropolisHostedPages.fromPageName(pageName)
      case `singaporeGrandPrixCampaignName` => Formula1HostedPages.fromPageName(pageName)
      case `chesterZooCampaignName` => ChesterZooHostedPages.fromPageName(pageName)
      case _ => None;
    }
  }

  def nextPages(campaignName: String, pageName: String, contentType: Option[HostedContentType.Value] = None): List[NextHostedPage] = {
    campaignName match {
      case `chesterZooCampaignName` => ChesterZooHostedPages.nextPages(pageName, contentType)
      case _ => Nil;
    }
  }
}
