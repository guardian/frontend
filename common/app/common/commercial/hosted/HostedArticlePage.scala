package common.commercial.hosted

import com.gu.contentapi.client.model.v1.ElementType.Image
import com.gu.contentapi.client.model.v1.{Asset, Content}
import common.Logging
import common.commercial.hosted.hardcoded.{HostedPages, NextHostedPage}
import model.MetaData

case class HostedArticlePage(
  override val id: String,
  override val campaign: HostedCampaign,
  override val pageName: String,
  override val title: String,
  override val standfirst: String,
  body: String,
  override val cta: HostedCallToAction,
  mainPicture: String,
  mainPictureCaption: String,
  override val socialShareText: Option[String],
  override val shortSocialShareText: Option[String],
  nextPagesList: List[NextHostedPage] = List(),
  nextPageNames: List[String] = List(),
  override val metadata: MetaData
) extends HostedPage {

  override val imageUrl = mainPicture

  def nextPages: List[NextHostedPage] = nextPagesList ++ nextPageNames.flatMap(
    HostedPages.fromCampaignAndPageName(campaign.id, _)
  ).map(
    page => NextHostedPage(
      id = page.id,
      imageUrl = page.imageUrl,
      title = page.title,
      contentType = HostedPages.contentType(page)
    )
  )
}

object HostedArticlePage extends Logging {

  def fromContent(content: Content): Option[HostedArticlePage] = {
    val page = for {
      campaignId <- content.sectionId map (_.stripPrefix("advertiser-content/"))
      campaign <- HostedCampaign.fromContent(content)
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
        id = content.id,
        campaign,
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
