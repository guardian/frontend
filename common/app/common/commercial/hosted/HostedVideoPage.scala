package common.commercial.hosted

import model.GuardianContentTypes._
import model.{MetaData, SectionSummary}
import play.api.libs.json.JsString

case class HostedVideoPage(
  campaign: HostedCampaign,
  pageUrl: String,
  pageName: String,
  standfirst: String,
  video: HostedVideo,
  cta: HostedCallToAction,
  ctaBanner: String,
  facebookShareText: Option[String] = None,
  twitterShareText: Option[String] = None,
  emailSubjectText: Option[String] = None,
  nextPage: Option[HostedPage] = None
) extends HostedPage {

  val pageTitle: String  = s"Advertiser content hosted by the Guardian: ${video.title} - video"
  val title = video.title
  val imageUrl = video.posterUrl

  override val metadata: MetaData = {
    val keywordId = s"${campaign.id}/${campaign.id}"
    val keywordName = campaign.id
    MetaData.make(
      id = s"commercial/advertiser-content/${campaign.id}/$pageName",
      webTitle = pageTitle,
      section = Some(SectionSummary.fromId(campaign.id)),
      contentType = Video,
      analyticsName = s"GFE:${campaign.id}:$Video:$pageName",
      description = Some(standfirst),
      javascriptConfigOverrides = Map(
        "keywordIds" -> JsString(keywordId),
        "keywords" -> JsString(keywordName),
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

case class HostedVideo(
  mediaId: String,
  title: String,
  duration: Int,
  posterUrl: String,
  srcUrlMp4: String,
  srcUrlWebm: String,
  srcUrlOgg: String,
  srcM3u8: String
)

case class HostedCallToAction(
  url: String,
  label: String,
  trackingCode: String,
  btnText: String
)
