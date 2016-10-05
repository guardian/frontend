package common.commercial.hosted

import com.gu.contentapi.client.model.v1.ElementType.Image
import com.gu.contentapi.client.model.v1.{Asset, Content, TagType}
import common.Logging
import common.commercial.hosted.hardcoded.HostedPages
import model.MetaData

case class HostedArticlePage(
  campaign: HostedCampaign,
  pageUrl: String,
  pageName: String,
  title: String,
  standfirst: String,
  body: String,
  cta: HostedCallToAction,
  mainPicture: String,
  mainPictureCaption: String,
  socialShareText: Option[String],
  shortSocialShareText: Option[String],
  nextPagesList: List[NextHostedPage] = List(),
  nextPageNames: List[String] = List(),
  metadata: MetaData
) extends HostedPage {

  val pageTitle = s"Advertiser content hosted by the Guardian: $title"
  val imageUrl = mainPicture

  def nextPages: List[NextHostedPage] = nextPagesList ++ nextPageNames.flatMap(
    HostedPages.fromCampaignAndPageName(campaign.id, _)).map(page => NextHostedPage(imageUrl = page.imageUrl, title = page.title, pageUrl = page.pageUrl, contentType = page.contentType)
  )
}

object HostedArticlePage extends Logging {

  def fromContent(content: Content): Option[HostedArticlePage] = {
    val page = for {
      campaignId <- content.sectionId map (_.stripPrefix("advertiser-content/"))
      campaignName <- content.sectionName
      tags = content.tags
      hostedTag <- tags find (_.paidContentType.contains("HostedContent"))
      sponsorships <- hostedTag.activeSponsorships
      sponsorship <- sponsorships.headOption
      toneTag <- tags find (_.`type` == TagType.Tone)
      atoms <- content.atoms
      ctaAtoms <- atoms.cta
      ctaAtom <- ctaAtoms.headOption
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

      HostedArticlePage(
        campaign = HostedCampaign(
          id = campaignId,
          name = campaignName,
          owner = sponsorship.sponsorName,
          logoUrl = sponsorship.sponsorLogo,
          fontColour = FontColour(hostedTag.paidContentCampaignColour getOrElse "")
        ),
        pageUrl = content.webUrl,
        pageName = content.webTitle,
        title = content.webTitle,
        // using capi trail text instead of standfirst because we don't want the markup
        standfirst = content.fields.flatMap(_.trailText).getOrElse(""),
        body = content.fields.flatMap(_.body).getOrElse(""),
        cta = HostedCallToAction.fromAtom(ctaAtom),
        mainPicture = mainImageAsset.flatMap(_.file) getOrElse "",
        mainPictureCaption = mainImageAsset.flatMap(_.typeData.flatMap(_.caption)).getOrElse(""),
        socialShareText = content.fields.flatMap(_.socialShareText),
        shortSocialShareText = content.fields.flatMap(_.shortSocialShareText),
        nextPagesList = HostedPages.nextPages(campaignName = campaignId, pageName = content.webUrl.split(campaignId + "/")(1)),
        metadata = HostedMetadata.fromContent(content).copy(openGraphImages = mainImageAsset.flatMap(_.file).toList)
      )
    }

    if (page.isEmpty) log.error(s"Failed to build HostedArticlePage from ${content.id}")

    page
  }

}
