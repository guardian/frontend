package common.commercial.hosted

import com.gu.contentapi.client.model.v1.ElementType.Image
import com.gu.contentapi.client.model.v1.{Asset, Content, Element}
import common.Logging
import common.commercial.hosted.hardcoded.{HostedPages, NextHostedPage}
import model.MetaData

case class HostedGalleryPage(
  override val id: String,
  override val campaign: HostedCampaign,
  override val pageName: String,
  override val title: String,
  override val standfirst: String,
  override val cta: HostedCallToAction,
  ctaIndex: Option[Integer] = None,
  override val socialShareText: Option[String] = None,
  override val shortSocialShareText: Option[String] = None,
  images: List[HostedGalleryImage],
  nextPagesList: List[NextHostedPage] = List(),
  nextPageNames: List[String] = List(),
  override val metadata: MetaData
) extends HostedPage {

  override val imageUrl = images.headOption.map(_.url).getOrElse("")

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
      campaign <- HostedCampaign.fromContent(content)
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
        campaign,
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
