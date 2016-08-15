package common.commercial.hosted

import com.gu.contentapi.client.model.v1.{Content, TagType}
import com.gu.contentatom.thrift.AtomData
import common.Logging
import conf.Static
import model.GuardianContentTypes._
import model.{MetaData, SectionSummary}

case class HostedVideoPage(
  campaign: HostedCampaign,
  pageUrl: String,
  pageName: String,
  standfirst: String,
  video: HostedVideo,
  cta: HostedCallToAction,
  facebookShareText: Option[String] = None,
  twitterShareText: Option[String] = None,
  emailSubjectText: Option[String] = None,
  nextPage: Option[HostedPage] = None,
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
    } yield {

      val video = videoAtom.data.asInstanceOf[AtomData.Media].media
      val videoVariants = video.assets filter (asset => video.activeVersion.contains(asset.version))
      def videoUrl(mimeType: String) = videoVariants.find(_.mimeType.contains(mimeType)).map(_.id) getOrElse ""

      val pageId = content.id
      val pageUrl = content.webUrl
      val pageTitle = content.webTitle
      val owner = sponsorship.sponsorName
      val standfirst = content.fields flatMap (_.standfirst) getOrElse ""

      val metadata = MetaData.make(
        id = pageId,
        section = content.sectionId map SectionSummary.fromId,
        webTitle = pageTitle,
        analyticsName = s"GFE:$campaignId:$Video:$pageTitle",
        url = Some(s"/$pageId"),
        description = Some(standfirst),
        contentType = Video,
        iosType = Some(Video),
        opengraphPropertiesOverrides = Map(
          "og:url" -> pageUrl,
          "og:title" -> pageTitle,
          "og:description" ->
          s"ADVERTISER CONTENT FROM ${owner.toUpperCase} HOSTED BY THE GUARDIAN | $standfirst",
          "og:image" -> video.posterUrl.getOrElse(""),
          "fb:app_id" -> "180444840287"
        ),
        twitterPropertiesOverrides = Map()
      )

      HostedVideoPage(
        campaign = HostedCampaign(
          id = campaignId,
          name = campaignName,
          owner,
          logo = HostedLogo(
            url = sponsorship.sponsorLogo
          ),
          // todo: standardise css so that only colour varies
          cssClass = "renault",
          logoLink = None
        ),
        pageUrl,
        pageName = pageTitle,
        standfirst,
        video = HostedVideo(
          mediaId = campaignId,
          title = video.title,
          duration = video.duration.map(_.toInt) getOrElse 0,
          posterUrl = video.posterUrl getOrElse "",
          srcUrlMp4 = videoUrl("video/mp4"),
          srcUrlWebm = videoUrl("video/webm"),
          srcUrlOgg = videoUrl("video/ogg"),
          srcM3u8 = videoUrl("video/m3u8")
        ),
        // todo: from cta atom
        cta = HostedCallToAction(
          url = "https://www.renault.co.uk/vehicles/new-vehicles/zoe.html",
          image = Some(Static("images/commercial/ren_commercial_banner.jpg")),
          label = Some("Discover Zoe"),
          trackingCode = Some("explore-renault-zoe-button"),
          btnText = None
        ),
        // todo: missing data
        facebookShareText = None,
        // todo: missing data
        twitterShareText = None,
        // todo: missing data
        emailSubjectText = None,
        // todo: related content
        nextPage = None,
        metadata
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
  srcUrlMp4: String,
  srcUrlWebm: String,
  srcUrlOgg: String,
  srcM3u8: String
)

case class HostedCallToAction(
  url: String,
  image: Option[String] = None,
  label: Option[String] = None,
  trackingCode: Option[String] = None,
  btnText: Option[String] = None
)
