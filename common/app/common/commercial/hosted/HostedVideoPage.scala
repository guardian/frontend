package common.commercial.hosted

import com.gu.contentapi.client.model.v1.Content
import com.gu.contentatom.thrift.AtomData
import common.Logging
import common.commercial.hosted.HostedUtils.getAndLog
import model.MetaData

case class HostedVideoPage(
  override val id: String,
  override val campaign: HostedCampaign,
  override val standfirst: String,
  video: HostedVideo,
  override val cta: HostedCallToAction,
  override val socialShareText: Option[String],
  override val shortSocialShareText: Option[String],
  override val metadata: MetaData
) extends HostedPage {
  override val title = video.title
  override val imageUrl = video.posterUrl
}

object HostedVideoPage extends Logging {

  def fromContent(content: Content): Option[HostedVideoPage] = {
    log.info(s"Building hosted video ${content.id} ...")

    val page = for {
      campaign <- HostedCampaign.fromContent(content)
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

      HostedVideoPage(
        id = content.id,
        campaign,
        standfirst,
        video = HostedVideo(
          mediaId = videoAtom.id,
          title = video.title,
          duration = video.duration.map(_.toInt) getOrElse 0,
          posterUrl = video.posterUrl getOrElse "",
          youtubeId = videoVariants.find(_.platform.toString.contains("Youtube")).map(_.id),
          sources = videoVariants.flatMap(asset => asset.mimeType map (mimeType => VideoSource(mimeType, asset.id)))
        ),
        cta = HostedCallToAction.fromAtom(ctaAtom),
        socialShareText = content.fields.flatMap(_.socialShareText),
        shortSocialShareText = content.fields.flatMap(_.shortSocialShareText),
        metadata = HostedMetadata.fromContent(content).copy(openGraphImages = video.posterUrl.toList)
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
  sources: Seq[VideoSource]
)

case class VideoSource(mimeType: String, url: String)
