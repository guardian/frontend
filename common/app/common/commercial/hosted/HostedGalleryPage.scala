package common.commercial.hosted

import com.gu.contentapi.client.model.v1.ElementType.Image
import com.gu.contentapi.client.model.v1.{Asset, Content, Element, TagType}
import common.Logging
import common.commercial.hosted.hardcoded.HostedPages
import model.MetaData

case class HostedGalleryPage(
  id: String,
  campaign: HostedCampaign,
  pageName: String,
  title: String,
  standfirst: String,
  cta: HostedCallToAction,
  ctaIndex: Option[Integer] = None,
  socialShareText: Option[String] = None,
  shortSocialShareText: Option[String] = None,
  images: List[HostedGalleryImage],
  nextPagesList: List[NextHostedPage] = List(),
  nextPageNames: List[String] = List(),
  metadata: MetaData
) extends HostedPage {

  val pageTitle: String = s"Advertiser content hosted by the Guardian: $title - gallery"
  val imageUrl = images.headOption.map(_.url).getOrElse("")

  def nextPages: List[NextHostedPage] = nextPagesList ++ nextPageNames.flatMap(
    HostedPages.fromCampaignAndPageName(campaign.id, _)
  ).map(
    page => NextHostedPage(
      id = page.id,
      imageUrl = page.imageUrl,
      title = page.title,
      contentType = page.contentType
    )
  )
}

case class HostedGalleryImage(
  url: String,
  title: String,
  caption: String = "",
  credit: String = ""
)

object HostedGalleryPage extends Logging {

  def fromContent(content: Content): Option[HostedGalleryPage] = {
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
        val elements: Option[Seq[Element]] = content.elements
        val optElement = elements.flatMap(
          _.find { element =>
            element.`type` == Image && element.relation == "main"
          }
        )
        optElement.map { element =>
          element.assets.maxBy(_.typeData.flatMap(_.width).getOrElse(0))
        }
      }

      val galleryImages = {
        val elements: Seq[Element] = content.elements.map(
          _.filter { element => element.`type` == Image && element.relation == "gallery" }
        ).getOrElse(Nil)
        elements.map { element =>
          val asset = element.assets.maxBy(_.typeData.flatMap(_.width).getOrElse(0))
          HostedGalleryImage(
            url = asset.file.getOrElse(""),
            title = asset.typeData.flatMap(_.altText).getOrElse(""),
            caption = asset.typeData.flatMap(_.caption).getOrElse(""),
            credit = asset.typeData.flatMap(_.credit).getOrElse("")
          )
        }
      }

      HostedGalleryPage(
        id = content.id,
        campaign = HostedCampaign(
          id = campaignId,
          name = campaignName,
          owner = sponsorship.sponsorName,
          logo = HostedLogo(
            url = sponsorship.sponsorLogo
          ),
          fontColour = FontColour(hostedTag.paidContentCampaignColour getOrElse ""),
          logoLink = None
        ),
        images = galleryImages.toList,
        pageName = content.webTitle,
        title = content.webTitle,
        // using capi trail text instead of standfirst because we don't want the markup
        standfirst = content.fields.flatMap(_.trailText).getOrElse(""),

        cta = HostedCallToAction.fromAtom(ctaAtom),

        socialShareText = content.fields.flatMap(_.socialShareText),
        shortSocialShareText = content.fields.flatMap(_.shortSocialShareText),
        nextPagesList = HostedPages.nextPages(campaignName = campaignId, pageName = content.webUrl.split(campaignId + "/")(1)),
        metadata = HostedMetadata.fromContent(content).copy(openGraphImages = mainImageAsset.flatMap(_.file).toList)
      )
    }

    if (page.isEmpty) log.error(s"Failed to build HostedGalleryPage from ${content.id}")

    page
  }

}
