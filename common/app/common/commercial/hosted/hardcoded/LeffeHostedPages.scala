package common.commercial.hosted.hardcoded

import common.commercial.{Dimensions, Logo}
import common.commercial.hosted._
import conf.Static

object LeffeHostedPages {

  private val willardWiganPageName = "willard-wigan"
  private val adrienneTreebyPageName = "adrienne-treeby"
  private val peteLawrencePageName = "pete-lawrence"
  private val susanDergesPageName = "susan-derges"
  private val quayBrothersPageName = "quay-brothers"

  private val campaign = HostedCampaign(
    id = "leffe-rediscover-time",
    name = "Leffe - Rediscover Time",
    owner = "Leffe",
    logo = Logo(
      Static("images/commercial/leffe.jpg"),
      Some(Dimensions(width = 132, height = 132))
    ),
    fontColour = Colour("#dec190")
  )

  private val cta = HostedCallToAction(
    url = "https://www.facebook.com/Leffe.uk/",
    label = Some("Rediscover Time"),
    image = Some(Static("images/commercial/leffe_banner.png")),
    trackingCode = Some("leffe-rediscover-time"),
    btnText = Some("Visit Leffe on Facebook")
  )

  private val videoSrcRoot = "https://cdn.theguardian.tv/interactive"

  private val willardWiganPageWithoutNextPage: HostedVideoPage = {
    val id = s"advertiser-content/${campaign.id}/$willardWiganPageName"
    val pageName = willardWiganPageName
    val standfirst = "Leffe presents a film about micro-sculptor Willard Wigan, who slows down his own heartbeat to " +
                     "create sculptures so tiny the eye can't see them."
    val videoTitle = "Slow Time: What is nothing?"
    val video = HostedVideo(
      mediaId = willardWiganPageName,
      title = videoTitle,
      duration = 127,
      posterUrl = Static("images/commercial/willard-wigan_poster.jpg"),
      sources = Seq(
        VideoSource(
          "video/mp4",
          s"$videoSrcRoot/2016/06/29/160629WillardWigan_V3_2M_H264.mp4"
        ),
        VideoSource(
          "video/webm",
          s"$videoSrcRoot/2016/06/29/160629WillardWigan_V3_2M_vp8.webm"
        ),
        VideoSource(
          "video/ogg",
          s"$videoSrcRoot/mp4/1080/2016/06/29/160629WillardWigan_V3_hi.ogv"
        ),
        VideoSource(
          "video/m3u8",
          s"$videoSrcRoot/2016/06/29/HLS/160629WillardWigan_V3.m3u8"
        )
      )
    )
    HostedVideoPage(
      id,
      campaign,
      pageName,
      standfirst,
      video,
      cta,
      socialShareText = None,
      shortSocialShareText = Some("Leffe presents Slow Time: What Is Nothing? Features @willard_wigan. Watch full film: "),
      nextPage = None,
      metadata = Metadata.forHardcodedHostedVideoPage(id, campaign, video, pageName, standfirst)
    )
  }

  private val adrienneTreebyPageWithoutNextPage: HostedVideoPage = {
    val id = s"advertiser-content/${campaign.id}/$adrienneTreebyPageName"
    val pageName = adrienneTreebyPageName
    val standfirst = "Leffe presents a film about charcuterie producer Adrienne E. Treeby, who uses centuries-old " +
                     "recipe ideas to cure a delicious Leffe-infused salami."
    val videoTitle = "Slow Time: Tasting the past"
    val video = HostedVideo(
      mediaId = adrienneTreebyPageName,
      title = videoTitle,
      duration = 116,
      posterUrl = Static("images/commercial/adrienne-treeby_poster.jpg"),
      sources = Seq(
        VideoSource(
          "video/mp4",
          s"$videoSrcRoot/2016/06/29/160629AdrienneTreeby_KP-28311272_h264_mezzanine_2M_H264.mp4"
        ),
        VideoSource(
          "video/webm",
          s"$videoSrcRoot/2016/06/29/160629AdrienneTreeby_KP-28311272_h264_mezzanine_2M_vp8.webm"
        ),
        VideoSource(
          "video/ogg",
          s"$videoSrcRoot/mp4/1080/2016/06/29/160629AdrienneTreeby_KP-28311272_h264_mezzanine_hi.ogv"
        ),
        VideoSource(
          "video/m3u8",
          s"$videoSrcRoot/2016/06/29/HLS/160629AdrienneTreeby_KP-28311272_h264_mezzanine.m3u8"
        )
      )
    )
    HostedVideoPage(
      id,
      campaign,
      pageName,
      standfirst,
      video,
      cta,
      socialShareText = None,
      shortSocialShareText = Some("Leffe presents Slow Time: Tasting The Past, feat @crownandqueue. Watch full film: "),
      nextPage = None,
      metadata = Metadata.forHardcodedHostedVideoPage(id, campaign, video, pageName, standfirst)
    )
  }

  private val peteLawrencePageWithoutNextPage: HostedVideoPage = {
    val id = s"advertiser-content/${campaign.id}/$peteLawrencePageName"
    val pageName = peteLawrencePageName
    val standfirst = "Leffe presents a film featuring astronomical observer Pete Lawrence as he literally rediscovers" +
                     " time, capturing distance light using long exposures."
    val videoTitle = "Slow Time: Capturing time"
    val video = HostedVideo(
      mediaId = peteLawrencePageName,
      title = videoTitle,
      duration = 138,
      posterUrl = Static("images/commercial/pete-lawrence_poster.jpg"),
      sources = Seq(
        VideoSource(
          "video/mp4",
          s"$videoSrcRoot/2016/06/29/160629PeteLawrence_h264_mezzanine_2M_H264.mp4"
        ),
        VideoSource(
          "video/webm",
          s"$videoSrcRoot/2016/06/29/160629PeteLawrence_h264_mezzanine_2M_vp8.webm"
        ),
        VideoSource(
          "video/ogg",
          s"$videoSrcRoot/mp4/1080/2016/06/29/160629PeteLawrence_h264_mezzanine_mid.ogv"
        ),
        VideoSource(
          "video/m3u8",
          s"$videoSrcRoot/2016/06/29/HLS/160629PeteLawrence_h264_mezzanine.m3u8"
        )
      )
    )
    HostedVideoPage(
      id,
      campaign,
      pageName,
      standfirst,
      video,
      cta,
      socialShareText = None,
      shortSocialShareText = Some(
        "Leffe presents Slow Time: Capturing Time, featuring @Avertedvision. Watch full film: "
      ),
      nextPage = None,
      metadata = Metadata.forHardcodedHostedVideoPage(id, campaign, video, pageName, standfirst)
    )
  }

  private val susanDergesPageWithoutNextPage: HostedVideoPage = {
    val id = s"advertiser-content/${campaign.id}/$susanDergesPageName"
    val pageName = susanDergesPageName
    val standfirst = "Leffe presents a film about artist Susan Derges, who specialises in creating unique camera-less" +
                     " photos using natural light and water."
    val videoTitle = "Slow Time: Still The river"
    val video = HostedVideo(
      mediaId = susanDergesPageName,
      title = videoTitle,
      duration = 146,
      posterUrl = Static("images/commercial/susan-derges_poster.jpg"),
      sources = Seq(
        VideoSource(
          "video/mp4",
          s"$videoSrcRoot/2016/06/29/160629SusanDerges_h264_mezzanine_2M_H264.mp4"
        ),
        VideoSource(
          "video/webm",
          s"$videoSrcRoot/2016/06/29/160629SusanDerges_h264_mezzanine_2M_vp8.webm"
        ),
        VideoSource(
          "video/ogg",
          s"$videoSrcRoot/mp4/1080/2016/06/29/160629SusanDerges_h264_mezzanine-1_lo.ogv"
        ),
        VideoSource(
          "video/m3u8",
          s"$videoSrcRoot/2016/06/29/HLS/160629SusanDerges_h264_mezzanine.m3u8"
        )
      )
    )
    HostedVideoPage(
      id,
      campaign,
      pageName,
      standfirst,
      video,
      cta,
      socialShareText = None,
      shortSocialShareText = Some("Leffe presents Slow Time: Still The River. Watch full film: "),
      nextPage = None,
      metadata = Metadata.forHardcodedHostedVideoPage(id, campaign, video, pageName, standfirst)
    )
  }

  private val quayBrothersPageWithoutNextPage: HostedVideoPage = {
    val id = s"advertiser-content/${campaign.id}/$quayBrothersPageName"
    val pageName = quayBrothersPageName
    val standfirst = "Leffe presents a film featuring influential stop-frame animators, Stephen and Timothy Quay, who" +
                     " give an insight into their unique appreciation of time."
    val videoTitle = "Slow Time: Quay Brothers"
    val video = HostedVideo(
      mediaId = quayBrothersPageName,
      title = videoTitle,
      duration = 134,
      posterUrl = Static("images/commercial/quay-brothers_poster.jpg"),
      sources = Seq(
        VideoSource(
          "video/mp4",
          s"$videoSrcRoot/2016/06/29/160629QuayBrothers_V3_2M_H264.mp4"
        ),
        VideoSource(
          "video/webm",
          s"$videoSrcRoot/2016/06/29/160629QuayBrothers_V3_2M_vp8.webm"
        ),
        VideoSource(
          "video/ogg",
          s"$videoSrcRoot/mp4/1080/2016/06/29/160629QuayBrothers_V3-3_hi.ogv"
        ),
        VideoSource(
          "video/m3u8",
          s"$videoSrcRoot/2016/06/29/HLS/160629QuayBrothers_V3.m3u8"
        )
      )
    )
    HostedVideoPage(
      id,
      campaign,
      pageName,
      standfirst,
      video,
      cta,
      socialShareText = None,
      shortSocialShareText = Some("Leffe presents Slow Time: Quay Brothers . Watch full film: "),
      nextPage = None,
      metadata = Metadata.forHardcodedHostedVideoPage(id, campaign, video, pageName, standfirst)
    )
  }

  private def withNextPage(hostedPage: HostedVideoPage, newPage: HostedPage): HostedPage = {
    val nextPage: Some[NextHostedPage] = Some(
      NextHostedPage(
        id = newPage.id,
        imageUrl = newPage.imageUrl,
        title = newPage.title,
        contentType = HostedPages.contentType(newPage)
      )
    )
    hostedPage.copy(nextPage = nextPage, nextVideo = nextPage)
  }

  private lazy val willardWiganPage = withNextPage(willardWiganPageWithoutNextPage, adrienneTreebyPageWithoutNextPage)

  private lazy val adrienneTreebyPage = withNextPage(adrienneTreebyPageWithoutNextPage, peteLawrencePageWithoutNextPage)

  private lazy val peteLawrencePage = withNextPage(peteLawrencePageWithoutNextPage, susanDergesPageWithoutNextPage)

  private lazy val susanDergesPage = withNextPage(susanDergesPageWithoutNextPage, quayBrothersPageWithoutNextPage)

  private lazy val quayBrothersPage = withNextPage(quayBrothersPageWithoutNextPage, willardWiganPageWithoutNextPage)

  def fromPageName(pageName: String): Option[HostedPage] = {
    pageName match {
      case `willardWiganPageName` => Some(willardWiganPage)
      case `adrienneTreebyPageName` => Some(adrienneTreebyPage)
      case `peteLawrencePageName` => Some(peteLawrencePage)
      case `susanDergesPageName` => Some(susanDergesPage)
      case `quayBrothersPageName` => Some(quayBrothersPage)
      case _ => None
    }
  }
}
