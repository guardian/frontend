package common.commercial.hosted

import com.gu.contentapi.client.model.v1.Content
import com.gu.contentatom.thrift.AtomData
import common.GuLogging
import common.commercial.hosted.ContentUtils.{imageForSocialShare, thumbnailUrl}
import common.commercial.hosted.LoggingUtils.getAndLog
import model.{Encoding, EncodingOrdering, MetaData}
import views.support.{ImgSrc, Item1200, Item700}

case class HostedVideoPage(
    override val id: String,
    override val campaign: Option[HostedCampaign],
    override val standfirst: String,
    video: HostedVideo,
    override val cta: HostedCallToAction,
    override val socialShareText: Option[String],
    override val shortSocialShareText: Option[String],
    override val thumbnailUrl: String,
    override val metadata: MetaData,
) extends HostedPage {
  override val title = video.title
  override val mainImageUrl = video.posterUrl
}

object HostedVideoPage extends GuLogging {
  private implicit val ordering = EncodingOrdering

  def fromContent(content: Content): Option[HostedVideoPage] = {
    log.info(s"Building hosted video ${content.id} ...")

    val page = for {
      atoms <- getAndLog(content, content.atoms, "the atoms are missing")
      videoAtoms <- getAndLog(content, atoms.media, "the video atoms are missing")
      videoAtom <- getAndLog(content, videoAtoms.headOption, "the video atom is missing")
      ctaAtoms <- getAndLog(content, atoms.cta, "the CTA atoms are missing")
      ctaAtom <- getAndLog(content, ctaAtoms.headOption, "the CTA atom is missing")
    } yield {

      val video = videoAtom.data.asInstanceOf[AtomData.Media].media
      val videoVariants = video.assets filter (asset => video.activeVersion.contains(asset.version))

      // using capi trail text instead of standfirst because we don't want the markup
      val standfirst = content.fields.flatMap(_.trailText).getOrElse("")

      val mainImage: String = video.posterUrl getOrElse imageForSocialShare(content)

      HostedVideoPage(
        id = content.id,
        campaign = HostedCampaign.fromContent(content),
        standfirst,
        video = HostedVideo(
          mediaId = videoAtom.id,
          title = video.title,
          duration = video.duration.map(_.toInt) getOrElse 0,
          posterUrl = video.posterUrl getOrElse "",
          youtubeId = videoVariants.find(_.platform.toString.contains("Youtube")).map(_.id),
          sources =
            videoVariants.flatMap(asset => asset.mimeType map (mimeType => Encoding(asset.id, mimeType))).toSeq.sorted,
        ),
        cta = HostedCallToAction.fromAtom(ctaAtom),
        socialShareText = content.fields.flatMap(_.socialShareText),
        shortSocialShareText = content.fields.flatMap(_.shortSocialShareText),
        thumbnailUrl = thumbnailUrl(content),
        metadata = HostedMetadata
          .fromContent(content)
          .copy(
            schemaType = Some("https://schema.org/VideoObject"),
            openGraphImages = Seq(ImgSrc(mainImage, Item1200)),
            twitterPropertiesOverrides = Map(
              "twitter:image" -> ImgSrc(mainImage, Item700),
            ),
          ),
      )
    }

    if (page.isEmpty) log.error(s"Failed to build HostedVideoPage from $content")

    page
  }
}

case class HostedVideo(
    mediaId: String,
    title: String,
    duration: Int,
    posterUrl: String,
    youtubeId: Option[String] = None,
    sources: Seq[Encoding],
)
