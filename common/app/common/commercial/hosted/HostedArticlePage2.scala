package common.commercial.hosted

import com.gu.contentapi.client.model.v1.{Content, TagType}
import common.Logging
import common.commercial.hosted.hardcoded.HostedPages
import conf.Static
import model.GuardianContentTypes._
import model.{MetaData, SectionSummary}
import play.api.libs.json.JsString

case class HostedArticlePage2(
  campaign: HostedCampaign,
  pageUrl: String,
  pageName: String,
  title: String,
  standfirst: String,
  body: String,
  cta: HostedCallToAction,
  mainPicture: String,
  mainPictureCaption: String,
  facebookShareText: Option[String] = None,
  twitterShareText: Option[String] = None,
  emailSubjectText: Option[String] = None,
  nextPageNames: List[String] = List()
)
  extends HostedPage {

  val pageTitle = s"Advertiser content hosted by the Guardian: $title"
  val imageUrl = mainPicture

  def nextPages: List[HostedPage] = nextPageNames.flatMap(HostedPages.fromCampaignAndPageName(campaign.id, _) flatMap {
    case page: HostedPage => Some(page)
    case _ => None
  })

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

object HostedArticlePage2 extends Logging {

  def fromContent(content: Content): Option[HostedArticlePage2] = {
    val page = for {
      campaignId <- content.sectionId map (_.stripPrefix("advertiser-content/"))
      campaignName <- content.sectionName
      tags = content.tags
      hostedTag <- tags find (_.paidContentType.contains("HostedContent"))
      sponsorships <- hostedTag.activeSponsorships
      sponsorship <- sponsorships.headOption
      toneTag <- tags find (_.`type` == TagType.Tone)
    } yield {

      HostedArticlePage2(
        campaign = HostedCampaign(
          id = campaignId,
          name = campaignName,
          owner = sponsorship.sponsorName,
          logo = HostedLogo(
            url = sponsorship.sponsorLogo
          ),
          cssClass = "renault",
          fontColour = FontColour(hostedTag.paidContentCampaignColour getOrElse ""),
          logoLink = None
        ),
        pageUrl = content.webUrl,
        pageName = content.webTitle,
        title = "",
        standfirst = content.fields.flatMap(_.standfirst).getOrElse(""),
        body = content.fields.flatMap(_.body).getOrElse(""),
        // todo: from cta atom
        cta = HostedCallToAction(
          url = "https://www.renault.co.uk/vehicles/new-vehicles/zoe.html",
          image = Some(Static("images/commercial/ren_commercial_banner.jpg")),
          label = Some("Discover Zoe"),
          trackingCode = Some("explore-renault-zoe-button"),
          btnText = None
        ),
        mainPicture = "",
        mainPictureCaption = "",
        // todo: missing data
        facebookShareText = None,
        // todo: missing data
        twitterShareText = None,
        // todo: missing data
        emailSubjectText = None,
        // todo: related content
        nextPageNames = Nil
      )
    }

    if (page.isEmpty) log.error(s"Failed to build HostedArticlePage from ${content.id}")

    page
  }

}
