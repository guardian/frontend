package common.commercial.hosted

import model.GuardianContentTypes._
import model.{MetaData, SectionSummary}
import play.api.libs.json.JsString

case class HostedArticlePage2(
  campaign: HostedCampaign,
  pageUrl: String,
  pageName: String,
  title: String,
  standfirst: String,
  cta: HostedCallToAction,
  mainPicture: String,
  mainPictureCaption: String,
  facebookShareText: Option[String] = None,
  twitterShareText: Option[String] = None,
  emailSubjectText: Option[String] = None,
  nextPage: Option[HostedPage] = None
)
  extends HostedPage {

  val pageTitle = s"Advertiser content hosted by the Guardian: $title"
  val imageUrl = mainPicture

  override val metadata: MetaData = {
    val keywordId = s"${campaign.id}/${campaign.id}"
    val keywordName = campaign.id
    MetaData.make(
      id = s"commercial/advertiser-content/${campaign.id}/$pageName",
      webTitle = pageTitle,
      section = Some(SectionSummary.fromId(campaign.id)),
      contentType = Article,
      analyticsName = s"GFE:${campaign.id}:$Article:$pageName",
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
        "og:image" -> mainPicture,
        "fb:app_id" -> "180444840287"
      )
    )
  }
}
