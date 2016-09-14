package common.commercial.hosted

import com.gu.contentapi.client.model.v1.ElementType.Image
import com.gu.contentapi.client.model.v1.{Asset, Content, TagType}
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
  nextPagesList: List[NextHostedPage] = List(),
  nextPageNames: List[String] = List()
)
  extends HostedPage {

  val pageTitle = s"Advertiser content hosted by the Guardian: $title"
  val imageUrl = mainPicture

  def nextPages: List[NextHostedPage] = nextPagesList ++ nextPageNames.flatMap(
    HostedPages.fromCampaignAndPageName(campaign.id, _)).map(page => NextHostedPage(imageUrl = page.imageUrl, title = page.title, pageUrl = page.pageUrl)
  )

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

      val mainImageAsset: Option[Asset] = {
        val optElement = content.elements.flatMap(
          _.find { element =>
            element.`type` == Image && element.relation == "main"
          }
        )
        optElement.map { element =>
          element.assets.maxBy(_.typeData.flatMap(_.width).getOrElse(0))
        }
      }

      HostedArticlePage2(
        campaign = HostedCampaign(
          id = campaignId,
          name = campaignName,
          owner = sponsorship.sponsorName,
          logo = HostedLogo(
            url = sponsorship.sponsorLogo
          ),
          cssClass = "", //TODO remove this variable later
          fontColour = FontColour(hostedTag.paidContentCampaignColour getOrElse ""),
          logoLink = None
        ),
        pageUrl = content.webUrl,
        pageName = content.webTitle,
        title = content.webTitle,
        // using capi trail text instead of standfirst because we don't want the markup
        standfirst = content.fields.flatMap(_.trailText).getOrElse(""),
        body = content.fields.flatMap(_.body).getOrElse(""),
        // todo: from cta atom
        cta = HostedCallToAction(
          url = "http://www.actforwildlife.org.uk/",
          image = Some("http://media.guim.co.uk/d723e82cdd399f013905a5ee806fea3591b4a363/0_926_3872_1666/2000.jpg"),
          label = Some("It's time to act for wildlife"),
          trackingCode = Some("act-for-wildlife-button"),
          btnText = None
        ),
        mainPicture = mainImageAsset.flatMap(_.file) getOrElse "",
        mainPictureCaption = mainImageAsset.flatMap(_.typeData.flatMap(_.caption)).getOrElse(""),
        // todo: missing data
        facebookShareText = None,
        // todo: missing data
        twitterShareText = None,
        // todo: missing data
        emailSubjectText = None,
        // todo: related content
        nextPagesList = HostedPages.nextPages(campaignName = campaignId, pageName = content.webUrl.split(campaignId + "/")(1))
      )
    }

    if (page.isEmpty) log.error(s"Failed to build HostedArticlePage from ${content.id}")

    page
  }

}
