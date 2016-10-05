package common.commercial.hosted

import com.gu.contentapi.client.model.v1.{Content, TagType}
import com.gu.contentatom.thrift.AtomData
import common.Logging
import common.commercial.hosted.hardcoded.HostedPages
import model.MetaData

case class HostedVideoPage(
  campaign: HostedCampaign,
  pageUrl: String,
  pageName: String,
  standfirst: String,
  video: HostedVideo,
  cta: HostedCallToAction,
  socialShareText: Option[String],
  shortSocialShareText: Option[String],
  nextPage: Option[NextHostedPage] = None,
  nextVideo: Option[NextHostedPage] = None,
  metadata: MetaData
) extends HostedPage {

  val pageTitle: String  = s"Advertiser content hosted by the Guardian: ${video.title} - video"
  val title = video.title
  val imageUrl = video.posterUrl
}

object HostedVideoPage extends Logging {

  def fromContent(content: Content): Option[HostedVideoPage] = {
    val page = for {
      campaignId <- content.sectionId map (_.stripPrefix("advertiser-content/"))
      campaignName <- content.sectionName
      tags = content.tags
      hostedTag <- tags find (_.paidContentType.contains("HostedContent"))
      sponsorships <- hostedTag.activeSponsorships
      sponsorship <- sponsorships.headOption
      toneTag <- tags find (_.`type` == TagType.Tone)
      atoms <- content.atoms
      videoAtoms <- atoms.media
      videoAtom <- videoAtoms.headOption
      ctaAtoms <- atoms.cta
      ctaAtom <- ctaAtoms.headOption
    } yield {

      val video = videoAtom.data.asInstanceOf[AtomData.Media].media
      val videoVariants = video.assets filter (asset => video.activeVersion.contains(asset.version))
      def videoUrl(mimeType: String) = videoVariants.find(_.mimeType.contains(mimeType)).map(_.id) getOrElse ""
      def youtubeId: Option[String] = videoVariants.find(_.platform.toString.contains("Youtube")).map(_.id)

      val pageUrl = content.webUrl
      val pageTitle = content.webTitle
      val owner = sponsorship.sponsorName
      // using capi trail text instead of standfirst because we don't want the markup
      val standfirst = content.fields.flatMap(_.trailText).getOrElse("")

      HostedVideoPage(
        campaign = HostedCampaign(
          id = campaignId,
          name = campaignName,
          owner,
          logoUrl = sponsorship.sponsorLogo,
          fontColour = FontColour(hostedTag.paidContentCampaignColour getOrElse "")
        ),
        pageUrl,
        pageName = pageTitle,
        standfirst,
        video = HostedVideo(
          mediaId = campaignId,
          title = video.title,
          duration = video.duration.map(_.toInt) getOrElse 0,
          posterUrl = video.posterUrl getOrElse "",
          youtubeId = youtubeId,
          sources = videoVariants.flatMap(asset => asset.mimeType map (mimeType => VideoSource(mimeType, asset.id)))
        ),
        cta = HostedCallToAction.fromAtom(ctaAtom),
        socialShareText = content.fields.flatMap(_.socialShareText),
        shortSocialShareText = content.fields.flatMap(_.shortSocialShareText),
        nextPage = HostedPages.nextPages(campaignName = campaignId, pageName = content.webUrl.split(campaignId + "/")(1)).headOption,
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
