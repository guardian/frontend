package common.commercial.hosted.hardcoded

import com.gu.contentapi.client.model.v1.ContentType.{Article, Gallery}
import common.commercial.hosted.{HostedCampaign, HostedGalleryImage, HostedVideo}
import model.GuardianContentTypes.Video
import model.{MetaData, SectionSummary}
import play.api.libs.json.{JsArray, JsBoolean, JsNumber, JsString}
import views.html.fragments.items.elements.facia_cards.title

object Metadata {

  val toneId = "tone/hosted"
  val toneName = "Hosted"

  def forHardcodedHostedVideoPage(
    campaign: HostedCampaign,
    video: HostedVideo,
    pageUrl: String,
    pageName: String,
    standfirst: String
  ): MetaData = {
    val campaignId = campaign.id
    val pageTitle = s"Advertiser content hosted by the Guardian: ${video.title} - video"
    MetaData.make(
      id = s"commercial/advertiser-content/$campaignId/$pageName",
      webTitle = pageTitle,
      section = Some(SectionSummary.fromId(campaignId)),
      contentType = Video,
      analyticsName = s"GFE:$campaignId:$Video:$pageName",
      description = Some(standfirst),
      javascriptConfigOverrides = Map(
        "isHosted" -> JsBoolean(true),
        "keywordIds" -> JsString(s"$campaignId/$campaignId"),
        "keywords" -> JsString(campaignId),
        "toneIds" -> JsString(toneId),
        "tones" -> JsString(toneName)
      ),
      opengraphPropertiesOverrides = Map(
        "og:url" -> pageUrl,
        "og:title" -> pageTitle,
        "og:description" ->
        s"ADVERTISER CONTENT FROM ${campaign.owner.toUpperCase} HOSTED BY THE GUARDIAN | $standfirst",
        "og:image" -> video.posterUrl,
        "fb:app_id" -> "180444840287"
      )
    )
  }

  def forHardcodedHostedArticlePage(
    campaign: HostedCampaign,
    pageUrl: String,
    pageName: String,
    pageTitle: String,
    standfirst: String,
    mainPicture: String
  ): MetaData = MetaData.make(
    id = s"commercial/advertiser-content/${campaign.id}/$pageName",
    webTitle = pageTitle,
    section = Some(SectionSummary.fromId(campaign.id)),
    contentType = Article.name,
    analyticsName = s"GFE:${campaign.id}:${Article.name}:$pageName",
    description = Some(standfirst),
    javascriptConfigOverrides = Map(
      "isHosted" -> JsBoolean(true),
      "toneIds" -> JsString(toneId),
      "tones" -> JsString(toneName)
    ),
    opengraphPropertiesOverrides = Map(
      "og:url" -> pageUrl,
      "og:title" -> pageTitle,
      "og:description" ->
      s"ADVERTISER CONTENT FROM ${campaign.owner.toUpperCase} HOSTED BY THE GUARDIAN | $standfirst",
      "og:image" -> mainPicture,
      "fb:app_id" -> "180444840287"
    )
  )

  def forHardcodedHostedGalleryPage(
    campaign: HostedCampaign,
    pageUrl: String,
    pageName: String,
    pageTitle: String,
    images: List[HostedGalleryImage]
  ): MetaData = {
    val sectionId = campaign.id
    MetaData.make(
      id = s"commercial/advertiser-content/$sectionId/$pageName",
      webTitle = pageTitle,
      section = Some(SectionSummary.fromId(sectionId)),
      contentType = Gallery.name,
      analyticsName = s"GFE:$sectionId:$Gallery:$pageName",
      description = Some(pageTitle),
      javascriptConfigOverrides = Map(
        "isHosted" -> JsBoolean(true),
        "toneIds" -> JsString(toneId),
        "tones" -> JsString(toneName),
        "pageName" -> JsString(pageName),
        "trackingPrefix" -> JsString(s"Hosted:GFE:gallery:$pageName:"),
        "images" -> JsArray(images.map((image) => JsString(image.url))),
        "ctaIndex" -> JsNumber(BigDecimal(images.length - 1))
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
