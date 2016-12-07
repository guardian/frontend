package common.commercial.hosted.hardcoded

import com.gu.contentapi.client.model.v1.ContentType.{Article, Gallery}
import common.commercial.hosted.{HostedCampaign, HostedGalleryImage, HostedVideo}
import conf.Configuration.site
import model.GuardianContentTypes.Video
import model.{MetaData, SectionSummary}
import play.api.libs.json.{JsArray, JsBoolean, JsNumber, JsString}
import views.html.fragments.items.elements.facia_cards.title

object Metadata {

  private val toneId = "tone/hosted"
  private val toneName = "Hosted"

  def forHardcodedHostedVideoPage(
    id: String,
    campaign: HostedCampaign,
    video: HostedVideo,
    pageName: String,
    standfirst: String
  ): MetaData = {
    val campaignId = campaign.id
    val pageTitle = s"Advertiser content hosted by the Guardian: ${video.title} - video"
    MetaData.make(
      id,
      isHosted= true,
      webTitle = pageTitle,
      section = Some(SectionSummary.fromId(campaignId)),
      contentType = Video,
      description = Some(standfirst),
      javascriptConfigOverrides = Map(
        "isHosted" -> JsBoolean(true),
        "keywordIds" -> JsString(s"$campaignId/$campaignId"),
        "keywords" -> JsString(campaignId),
        "toneIds" -> JsString(toneId),
        "tones" -> JsString(toneName)
      ),
      opengraphPropertiesOverrides = Map(
        "og:url" -> s"${site.host}/$id",
        "og:title" -> pageTitle,
        "og:description" ->
        s"ADVERTISER CONTENT FROM ${campaign.owner.toUpperCase} HOSTED BY THE GUARDIAN | $standfirst",
        "og:image" -> video.posterUrl,
        "fb:app_id" -> "180444840287"
      )
    )
  }

  def forHardcodedHostedArticlePage(
    id: String,
    campaign: HostedCampaign,
    pageName: String,
    pageTitle: String,
    standfirst: String,
    mainPicture: String
  ): MetaData = MetaData.make(
    id,
    isHosted= true,
    webTitle = pageTitle,
    section = Some(SectionSummary.fromId(campaign.id)),
    contentType = Article.name,
    description = Some(standfirst),
    javascriptConfigOverrides = Map(
      "isHosted" -> JsBoolean(true),
      "toneIds" -> JsString(toneId),
      "tones" -> JsString(toneName)
    ),
    opengraphPropertiesOverrides = Map(
      "og:url" -> s"${site.host}/$id",
      "og:title" -> pageTitle,
      "og:description" ->
      s"ADVERTISER CONTENT FROM ${campaign.owner.toUpperCase} HOSTED BY THE GUARDIAN | $standfirst",
      "og:image" -> mainPicture,
      "fb:app_id" -> "180444840287"
    )
  )

  def forHardcodedHostedGalleryPage(
    id: String,
    campaign: HostedCampaign,
    pageName: String,
    pageTitle: String,
    images: List[HostedGalleryImage]
  ): MetaData = {
    val sectionId = campaign.id
    MetaData.make(
      id,
      isHosted= true,
      webTitle = pageTitle,
      section = Some(SectionSummary.fromId(sectionId)),
      contentType = Gallery.name,
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
        "og:url" -> s"${site.host}/$id",
        "og:title" -> pageTitle,
        "og:description" ->
        s"ADVERTISER CONTENT FROM ${campaign.owner.toUpperCase} HOSTED BY THE GUARDIAN | $title",
        "og:image" -> images.head.url,
        "fb:app_id" -> "180444840287"
      )
    )
  }
}
