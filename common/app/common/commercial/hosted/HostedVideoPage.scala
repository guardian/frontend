package common.commercial.hosted

import com.gu.contentapi.client.model.v1.Content
import com.gu.contentatom.thrift.AtomData
import common.Logging
import common.commercial.hosted.hardcoded.{HostedContentType, HostedPages, NextHostedPage}
import model.MetaData

case class HostedVideoPage(
  override val id: String,
  override val campaign: HostedCampaign,
  override val pageName: String,
  override val standfirst: String,
  video: HostedVideo,
  override val cta: HostedCallToAction,
  override val socialShareText: Option[String],
  override val shortSocialShareText: Option[String],
  nextPage: Option[NextHostedPage] = None,
  nextVideo: Option[NextHostedPage] = None,
  override val metadata: MetaData
) extends HostedPage {
  override val title = video.title
  override val imageUrl = video.posterUrl
}

object HostedVideoPage extends Logging {

  def fromContent(content: Content): Option[HostedVideoPage] = {
    val page = for {
      campaignId <- content.sectionId map (_.stripPrefix("advertiser-content/"))
      campaign <- HostedCampaign.fromContent(content)
      atoms <- content.atoms
      videoAtoms <- atoms.media
      videoAtom <- videoAtoms.headOption
      ctaAtoms <- atoms.cta
      ctaAtom <- ctaAtoms.headOption
    } yield {

      val video = videoAtom.data.asInstanceOf[AtomData.Media].media
      val videoVariants = video.assets filter (asset => video.activeVersion.contains(asset.version))

      // using capi trail text instead of standfirst because we don't want the markup
      val standfirst = content.fields.flatMap(_.trailText).getOrElse("")

      HostedVideoPage(
        id = content.id,
        campaign,
        pageName = "only used in hardcoded content",
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
        nextVideo = HostedPages.nextPages(campaignName = campaignId, pageName = content.webUrl.split(campaignId + "/")(1), contentType = Some(HostedContentType.Video)).headOption,
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
