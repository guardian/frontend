package common.commercial.hosted

import com.gu.contentapi.client.model.v1.Content
import common.Logging
import common.commercial.hosted.ContentUtils._
import common.commercial.hosted.LoggingUtils.getAndLog
import model.MetaData

case class HostedGalleryPage(
  override val id: String,
  override val campaign: HostedCampaign,
  override val title: String,
  override val standfirst: String,
  override val cta: HostedCallToAction,
  ctaIndex: Option[Integer] = None,
  override val socialShareText: Option[String] = None,
  override val shortSocialShareText: Option[String] = None,
  images: List[HostedGalleryImage],
  override val thumbnailUrl: String,
  override val metadata: MetaData
) extends HostedPage {
  override val mainImageUrl = images.headOption.map(_.url).getOrElse("")
}

case class HostedGalleryImage(
  url: String,
  width: Option[Int] = None,
  height: Option[Int] = None,
  title: String,
  caption: String = "",
  credit: String = ""
)

object HostedGalleryPage extends Logging {

  def fromContent(content: Content): Option[HostedGalleryPage] = {
    log.info(s"Building hosted gallery ${content.id} ...")

    val page = for {
      campaign <- HostedCampaign.fromContent(content)
      atoms <- getAndLog(content, content.atoms, "the atoms are missing")
      ctaAtoms <- getAndLog(content, atoms.cta, "the CTA atoms are missing")
      ctaAtom <- getAndLog(content, ctaAtoms.headOption, "the CTA atom is missing")
    } yield {

      val galleryImages = {
        imageElements(content, "gallery") map { element =>
          val asset = findLargestAsset(element)
          HostedGalleryImage(
            url = asset.file.getOrElse(""),
            width = asset.typeData.flatMap(_.width),
            height = asset.typeData.flatMap(_.height),
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
        title = content.webTitle,
        // using capi trail text instead of standfirst because we don't want the markup
        standfirst = content.fields.flatMap(_.trailText).getOrElse(""),
        cta = HostedCallToAction.fromAtom(ctaAtom),
        socialShareText = content.fields.flatMap(_.socialShareText),
        shortSocialShareText = content.fields.flatMap(_.shortSocialShareText),
        thumbnailUrl = thumbnailUrl(content),
        metadata = HostedMetadata
          .fromContent(content)
          .copy(openGraphImages = findLargestMainImageAsset(content).flatMap(_.file).toList)
      )
    }

    if (page.isEmpty) log.error(s"Failed to build HostedGalleryPage from ${content.id}")

    page
  }

}
