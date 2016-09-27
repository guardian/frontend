package common.commercial.hosted

import com.gu.contentapi.client.model.v1.{Content, TagType}
import com.gu.contentatom.thrift.AtomData
import common.Logging
import common.commercial.hosted.hardcoded.HostedPages
import model.GuardianContentTypes._
import model.{MetaData, SectionSummary}
import play.api.libs.json.JsString

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
    } yield {

      val video = videoAtom.data.asInstanceOf[AtomData.Media].media
      val videoVariants = video.assets filter (asset => video.activeVersion.contains(asset.version))
      def videoUrl(mimeType: String) = videoVariants.find(_.mimeType.contains(mimeType)).map(_.id) getOrElse ""
      def youtubeId: Option[String] = videoVariants.find(_.platform.toString.contains("Youtube")).map(_.id)

      val pageId = content.id
      val pageUrl = content.webUrl
      val pageTitle = content.webTitle
      val owner = sponsorship.sponsorName
      // using capi trail text instead of standfirst because we don't want the markup
      val standfirst = content.fields.flatMap(_.trailText).getOrElse("")

      val toneId = toneTag.id
      //val toneName = toneTag.webTitle //TODO the toneTag.webTitle value should be Hosted not Advertisement Feature
      val toneName = "Hosted"

      val keywordId = s"${campaignId}/${campaignId}"
      val keywordName = campaignId

      val metadata = MetaData.make(
        id = pageId,
        section = content.sectionId map SectionSummary.fromId,
        webTitle = pageTitle,
        analyticsName = s"GFE:$campaignId:$Video:$pageTitle",
        url = Some(s"/$pageId"),
        description = Some(standfirst),
        contentType = Video,
        iosType = Some(Video),
        javascriptConfigOverrides = Map(
          "keywordIds" -> JsString(keywordId),
          "keywords" -> JsString(keywordName),
          "toneIds" -> JsString(toneId),
          "tones" -> JsString(toneName)
        ),
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
          fontColour = FontColour(hostedTag.paidContentCampaignColour getOrElse ""),
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
          youtubeId = youtubeId,
          srcUrlMp4 = videoUrl("video/mp4"),
          srcUrlWebm = videoUrl("video/webm"),
          srcUrlOgg = videoUrl("video/ogg"),
          srcM3u8 = videoUrl("video/m3u8")
        ),
        // todo: from cta atom
        cta = HostedCallToAction(
          url = "http://www.actforwildlife.org.uk/?utm_source=theguardian.com&utm_medium=referral&utm_campaign=LaunchCampaignSep2016",
          image = Some("http://media.guim.co.uk/d723e82cdd399f013905a5ee806fea3591b4a363/0_926_3872_1666/2000.jpg"),
          label = Some("It's time to act for wildlife"),
          trackingCode = Some("act-for-wildlife-button"),
          btnText = Some("Act for wildlife")
        ),
        socialShareText = content.fields.flatMap(_.socialShareText),
        shortSocialShareText = content.fields.flatMap(_.shortSocialShareText),
        // todo: related content
        nextPage = HostedPages.nextPages(campaignName = campaignId, pageName = content.webUrl.split(campaignId + "/")(1)).headOption,
        nextVideo = HostedPages.nextPages(campaignName = campaignId, pageName = content.webUrl.split(campaignId + "/")(1), contentType = Some(HostedContentType.Video)).headOption,
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
  youtubeId: Option[String] = None,
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
