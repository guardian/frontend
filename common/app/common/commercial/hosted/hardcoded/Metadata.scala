package common.commercial.hosted.hardcoded

import common.commercial.hosted.{HostedCampaign, HostedVideo}
import model.GuardianContentTypes.Video
import model.{MetaData, SectionSummary}
import play.api.libs.json.JsString

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
}
