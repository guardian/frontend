package common.commercial.hosted

import com.gu.contentapi.client.model.v1.Content
import common.GuLogging
import common.commercial.hosted.ContentUtils._
import common.commercial.hosted.LoggingUtils.getAndLog
import model.MetaData
import views.support.{ImgSrc, Item1200, Item700}

case class HostedGalleryPage(
    override val id: String,
    override val campaign: Option[HostedCampaign],
    override val title: String,
    override val standfirst: String,
    override val cta: HostedCallToAction,
    ctaIndex: Option[Integer] = None,
    override val socialShareText: Option[String] = None,
    override val shortSocialShareText: Option[String] = None,
    images: List[HostedGalleryImage],
    override val thumbnailUrl: String,
    override val metadata: MetaData,
) extends HostedPage {
  override val mainImageUrl = images.headOption.map(_.url).getOrElse("")
}

case class HostedGalleryImage(
    url: String,
    width: Option[Int] = None,
    height: Option[Int] = None,
    title: String,
    caption: String = "",
    credit: String = "",
)

object HostedGalleryPage extends GuLogging {

  def fromContent(content: Content): Option[HostedGalleryPage] = {
    log.debug(s"Building hosted gallery ${content.id} ...")

    val page = for {
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
            credit = asset.typeData.flatMap(_.credit).getOrElse(""),
          )
        }
      }

      val openGraphImages: Seq[String] = galleryImages.map { img =>
        ImgSrc(img.url, Item1200)
      }

      val twitterImage: String = ImgSrc(imageForSocialShare(content), Item700)

      HostedGalleryPage(
        id = content.id,
        campaign = HostedCampaign.fromContent(content),
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
          .copy(
            schemaType = Some("https://schema.org/ImageGallery"),
            openGraphImages = openGraphImages,
            twitterPropertiesOverrides = Map(
              "twitter:image" -> twitterImage,
            ),
          ),
      )
    }

    if (page.isEmpty) log.error(s"Failed to build HostedGalleryPage from ${content.id}")

    page
  }

}
