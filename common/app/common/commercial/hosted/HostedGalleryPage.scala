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
  nextPageNames: List[String] = List()
) extends HostedPage {

  val pageTitle: String = s"Advertiser content hosted by the Guardian: $title - gallery"
  val imageUrl = images.headOption.map(_.url).getOrElse("")

  def nextPages: List[NextHostedPage] = nextPagesList ++ nextPageNames.flatMap(
    HostedPages.fromCampaignAndPageName(campaign.id, _)).map(page => NextHostedPage(imageUrl = page.imageUrl, title = page.title, pageUrl = page.pageUrl, contentType = page.contentType)
  )

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
        s"ADVERTISER CONTENT FROM ${campaign.owner.toUpperCase} HOSTED BY THE GUARDIAN | $title",
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
