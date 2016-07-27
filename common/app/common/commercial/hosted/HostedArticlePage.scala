package common.commercial.hosted

import model.GuardianContentTypes._
import model.{MetaData, SectionSummary}
import play.api.libs.json.JsString

case class HostedArticlePage(
  campaign: HostedCampaign,
  pageUrl: String,
  pageName: String,
  title: String,
  standfirst: String,
  standfirstLink: String,
  facebookImageUrl: String,
  cta: HostedCallToAction,
  ctaBanner: String,
  mainPicture: String,
  twitterTxt: String,
  emailTxt: String,
  facebookShareText: Option[String] = None,
  twitterShareText: Option[String] = None,
  emailSubjectText: Option[String] = None,
  customData: CustomData,
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
        "og:image" -> facebookImageUrl,
        "fb:app_id" -> "180444840287"
      )
    )
  }
}

case class CustomData(
   conArtistPic: String,
   conArtistPoster: String,
   rookiePic: String,
   rookiePoster: String,
   chiefPic: String,
   chiefPoster: String,
   slothPic: String,
   slothPoster: String,
   deskClerkPic: String,
   deskClerkPoster: String,
   gazellePic: String,
   gazellePoster: String,
   posterPdf: String,
   colouringPdf: String
)
