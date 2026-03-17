package common.commercial.hosted

import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import common.GuLogging
import common.commercial.hosted.ContentUtils.{findLargestMainImageAsset, imageForSocialShare, thumbnailUrl}
import common.commercial.hosted.LoggingUtils.getAndLog
import model.{Content, MetaData}
import views.support.{ImgSrc, Item1200, Item700}

case class HostedArticlePage(
    override val id: String,
    override val campaign: Option[HostedCampaign],
    override val title: String,
    override val standfirst: String,
    body: String,
    override val cta: HostedCallToAction,
    mainPicture: String,
    mainPictureCaption: String,
    override val thumbnailUrl: String,
    override val socialShareText: Option[String],
    override val shortSocialShareText: Option[String],
    override val metadata: MetaData,
    content: Content,
) extends HostedPage {
  override val mainImageUrl = mainPicture
}

object HostedArticlePage extends GuLogging {

  def fromContent(content: ApiContent): Option[HostedArticlePage] = {
    log.debug(s"Building hosted article ${content.id} ...")

    val page = for {
      atoms <- getAndLog(content, content.atoms, "the atoms are missing")
      ctaAtoms <- getAndLog(content, atoms.cta, "the CTA atoms are missing")
      ctaAtom <- getAndLog(content, ctaAtoms.headOption, "the CTA atom is missing")
    } yield {

      val mainImageAsset = findLargestMainImageAsset(content)

      val openGraphImages: Seq[String] = Seq(ImgSrc(imageForSocialShare(content), Item1200))
      val twitterImage: String = ImgSrc(imageForSocialShare(content), Item700)

      HostedArticlePage(
        id = content.id,
        campaign = HostedCampaign.fromContent(content),
        title = content.webTitle,
        // using capi trail text instead of standfirst because we don't want the markup
        standfirst = content.fields.flatMap(_.trailText).getOrElse(""),
        body = content.fields.flatMap(_.body).getOrElse(""),
        cta = HostedCallToAction.fromAtom(ctaAtom),
        mainPicture = mainImageAsset.flatMap(_.file) getOrElse "",
        mainPictureCaption = mainImageAsset.flatMap(_.typeData.flatMap(_.caption)) getOrElse "",
        thumbnailUrl = thumbnailUrl(content),
        socialShareText = content.fields.flatMap(_.socialShareText),
        shortSocialShareText = content.fields.flatMap(_.shortSocialShareText),
        metadata = HostedMetadata
          .fromContent(content)
          .copy(
            openGraphImages = openGraphImages,
            twitterPropertiesOverrides = Map(
              "twitter:image" -> twitterImage,
            ),
          ),
        content = Content.make(content),
      )
    }

    if (page.isEmpty) log.error(s"Failed to build HostedArticlePage from ${content.id}")

    page
  }

}
