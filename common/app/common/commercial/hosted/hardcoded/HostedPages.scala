package common.commercial.hosted.hardcoded

import common.commercial.hosted._
import conf.switches.Switches.renaultSwitch

object LegacyHostedPages {

  private val renaultCampaignName = "renault-car-of-the-future"

  def fromCampaignAndPageName(campaignName: String, pageName: String): Option[HostedPage] = {
    campaignName match {
      case `renaultCampaignName` if renaultSwitch.isSwitchedOn => RenaultHostedPages.fromPageName(pageName)
      case _ => None;
    }
  }
}

object HostedPages {

  private val visitBritainCampaignName = "visit-britain"
  private val leffeCampaignName = "leffe-rediscover-time"
  private val singaporeGrandPrixCampaignName = "singapore-grand-prix"

  def fromCampaignAndPageName(campaignName: String, pageName: String): Option[HostedPage] = {
    campaignName match {
      case `visitBritainCampaignName` => VisitBritainHostedPages.fromPageName(pageName)
      case `leffeCampaignName` => LeffeHostedPages.fromPageName(pageName)
      case `singaporeGrandPrixCampaignName` => Formula1HostedPages.fromPageName(pageName)
      case _ => None;
    }
  }

  def nextPages(campaignName: String, pageName: String, contentType: Option[HostedContentType.Value] = None): List[NextHostedPage] = Nil

  def contentType(page: HostedPage): HostedContentType.Value = {
    page match {
      case _: HostedVideoPage => HostedContentType.Video
      case _: HostedArticlePage => HostedContentType.Article
      case _: HostedGalleryPage => HostedContentType.Gallery
      case _ => HostedContentType.Gallery
    }
  }
}

object HostedContentType extends Enumeration {

  val Video, Article, Gallery = Value
}
