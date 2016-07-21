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
  ctaText: String,
  ctaLink: String,
  ctaButtonText: String,
  ctaIndex: Option[Integer] = None,
  shareText: Option[String] = None,
  images: List[HostedGalleryImage],
  nextGalleryNames: List[String] = List()
) extends HostedPage {

  val pageTitle: String = s"Advertiser content hosted by the Guardian: $title - gallery"
  val twitterText = shareText.getOrElse(if(standfirst.length < 136) standfirst else title) + " #ad"

  def nextGalleries: List[HostedGalleryPage] = nextGalleryNames.flatMap(HostedPages.fromCampaignAndPageName(campaign.id, _) flatMap {
    case gallery: HostedGalleryPage => Some(gallery)
    case _ => None
  })

  override val metadata: MetaData = {
    val sectionId = campaign.id
    val keywordId = s"$sectionId/$sectionId"
    val keywordName = sectionId
    MetaData.make(
      id = s"commercial/advertiser-content/$sectionId/$pageName",
      webTitle = pageTitle,
      section = Some(SectionSummary.fromId(sectionId)),
      contentType = Gallery,
      analyticsName = s"GFE:$sectionId:$Gallery:$pageName",
      description = Some(pageTitle),
      javascriptConfigOverrides = Map(
        "keywordIds" -> JsString(keywordId),
        "keywords" -> JsString(keywordName),
        "toneIds" -> JsString(toneId),
        "tones" -> JsString(toneName),
        "pageName" -> JsString(pageName),
        "trackingPrefix" -> JsString(s"Hosted:GFE:gallery:$pageName:"),
        "images" -> JsArray(images.map((image) => JsString(image.url))),
        "ctaIndex" -> JsNumber(ctaIndex.map(BigDecimal(_)).getOrElse(BigDecimal(images.length - 1)))
      ),
      opengraphPropertiesOverrides = Map(
        "og:url" -> pageUrl,
        "og:title" -> pageTitle,
        "og:description" ->
        s"ADVERTISER CONTENT FROM OMGB HOSTED BY THE GUARDIAN | $title",
        "og:image" -> images.head.url,
        "fb:app_id" -> "180444840287"
      )
    )
  }
}

case class HostedGalleryImage(
  url: String,
  title: String,
  caption: String = "",
  credit: String = ""
)
