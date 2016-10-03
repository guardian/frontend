package common.commercial.hosted

import common.commercial.hosted.hardcoded.HostedPages
import model.GuardianContentTypes._
import model.{MetaData, SectionSummary}
import play.api.libs.json.{JsArray, JsNumber, JsString}

case class HostedGalleryPage(
  campaign: HostedCampaign,
  pageUrl: String,
  pageName: String,
  title: String,
  standfirst: String,
  cta: HostedCallToAction,
  ctaIndex: Option[Integer] = None,
  socialShareText: Option[String] = None,
  shortSocialShareText: Option[String] = None,
  images: List[HostedGalleryImage],
  nextPagesList: List[NextHostedPage] = List(),
  nextPageNames: List[String] = List(),
  metadata: MetaData
) extends HostedPage {

  val pageTitle: String = s"Advertiser content hosted by the Guardian: $title - gallery"
  val imageUrl = images.headOption.map(_.url).getOrElse("")

  def nextPages: List[NextHostedPage] = nextPagesList ++ nextPageNames.flatMap(
    HostedPages.fromCampaignAndPageName(campaign.id, _)).map(page => NextHostedPage(imageUrl = page.imageUrl, title = page.title, pageUrl = page.pageUrl, contentType = page.contentType)
  )
}

case class HostedGalleryImage(
  url: String,
  title: String,
  caption: String = "",
  credit: String = ""
)
