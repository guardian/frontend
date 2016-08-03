package common.commercial.hosted.hardcoded

import common.commercial.hosted._
import conf.Configuration.site.host
import conf.switches.Switches
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
    logo = HostedLogo(Static("images/commercial/leffe.jpg")),
    cssClass = "leffe"
  )

  private val cta = HostedCallToAction(
    url = "https://www.facebook.com/Leffe.uk/",
    label = "Rediscover Time",
    image = Static("images/commercial/leffe_banner.png"),
    trackingCode = "leffe-rediscover-time",
    btnText = "Visit Leffe on Facebook"
  )

  private val willardWiganPageWithoutNextPage: HostedVideoPage = {
    val videoTitle = "Slow Time: What is nothing?"
    HostedVideoPage(
      campaign,
      pageUrl = s"$host/advertiser-content/${campaign.id}/$willardWiganPageName",
      pageName = willardWiganPageName,
      standfirst = "Leffe presents a film about micro-sculptor Willard Wigan, who slows down his own heartbeat to " +
                   "create sculptures so tiny the eye can't see them.",
      video = HostedVideo(
        mediaId = willardWiganPageName,
        title = videoTitle,
        duration = 127,
        posterUrl = Static("images/commercial/willard-wigan_poster.jpg"),
        srcUrlMp4 = "https://cdn.theguardian.tv/interactive/2016/06/29/160629WillardWigan_V3_2M_H264.mp4",
        srcUrlWebm = "https://cdn.theguardian.tv/interactive/2016/06/29/160629WillardWigan_V3_2M_vp8.webm",
        srcUrlOgg = "https://cdn.theguardian.tv/interactive/mp4/1080/2016/06/29/160629WillardWigan_V3_hi.ogv",
        srcM3u8 = "https://cdn.theguardian.tv/interactive/2016/06/29/HLS/160629WillardWigan_V3.m3u8"
      ),
      cta,
      twitterShareText = Some("Leffe presents Slow Time: What Is Nothing? Features @willard_wigan. Watch full film: "),
      nextPage = None
    )
  }

  private val adrienneTreebyPageWithoutNextPage: HostedVideoPage = {
    val videoTitle = "Slow Time: Tasting the past"
    HostedVideoPage(
      campaign,
      pageUrl = s"$host/advertiser-content/${campaign.id}/$adrienneTreebyPageName",
      pageName = adrienneTreebyPageName,
      standfirst = "Leffe presents a film about charcuterie producer Adrienne E. Treeby, who uses centuries-old recipe " +
                   "ideas to cure a delicious Leffe-infused salami.",
      video = HostedVideo(
        mediaId = adrienneTreebyPageName,
        title = videoTitle,
        duration = 116,
        posterUrl = Static("images/commercial/adrienne-treeby_poster.jpg"),
        srcUrlMp4 = "https://cdn.theguardian" +
                    ".tv/interactive/2016/06/29/160629AdrienneTreeby_KP-28311272_h264_mezzanine_2M_H264.mp4",
        srcUrlWebm = "https://cdn.theguardian" +
                     ".tv/interactive/2016/06/29/160629AdrienneTreeby_KP-28311272_h264_mezzanine_2M_vp8.webm",
        srcUrlOgg = "https://cdn.theguardian" +
                    ".tv/interactive/mp4/1080/2016/06/29/160629AdrienneTreeby_KP-28311272_h264_mezzanine_hi.ogv",
        srcM3u8 = "https://cdn.theguardian" +
                  ".tv/interactive/2016/06/29/HLS/160629AdrienneTreeby_KP-28311272_h264_mezzanine.m3u8"
      ),
      cta,
      twitterShareText = Some("Leffe presents Slow Time: Tasting The Past, feat @crownandqueue. Watch full film: "),
      nextPage = None
    )
  }

  private val peteLawrencePageWithoutNextPage: HostedVideoPage = {
    val videoTitle = "Slow Time: Capturing time"
    HostedVideoPage(
      campaign,
      pageUrl = s"$host/advertiser-content/${campaign.id}/$peteLawrencePageName",
      pageName = peteLawrencePageName,
      standfirst = "Leffe presents a film featuring astronomical observer Pete Lawrence as he literally rediscovers " +
                   "time, capturing distance light using long exposures.",
      video = HostedVideo(
        mediaId = peteLawrencePageName,
        title = videoTitle,
        duration = 138,
        posterUrl = Static("images/commercial/pete-lawrence_poster.jpg"),
        srcUrlMp4 = "https://cdn.theguardian.tv/interactive/2016/06/29/160629PeteLawrence_h264_mezzanine_2M_H264.mp4",
        srcUrlWebm = "https://cdn.theguardian.tv/interactive/2016/06/29/160629PeteLawrence_h264_mezzanine_2M_vp8.webm",
        srcUrlOgg = "https://cdn.theguardian.tv/interactive/mp4/1080/2016/06/29/160629PeteLawrence_h264_mezzanine_mid" +
                    ".ogv",
        srcM3u8 = "https://cdn.theguardian.tv/interactive/2016/06/29/HLS/160629PeteLawrence_h264_mezzanine.m3u8"
      ),
      cta,
      twitterShareText = Some("Leffe presents Slow Time: Capturing Time, featuring @Avertedvision. Watch full film: "),
      nextPage = None
    )
  }

  private val susanDergesPageWithoutNextPage: HostedVideoPage = {
    val videoTitle = "Slow Time: Still The river"
    HostedVideoPage(
      campaign,
      pageUrl = s"$host/advertiser-content/${campaign.id}/$susanDergesPageName",
      pageName = susanDergesPageName,
      standfirst = "Leffe presents a film about artist Susan Derges, who specialises in creating unique camera-less " +
                   "photos using natural light and water.",
      video = HostedVideo(
        mediaId = susanDergesPageName,
        title = videoTitle,
        duration = 146,
        posterUrl = Static("images/commercial/susan-derges_poster.jpg"),
        srcUrlMp4 = "https://cdn.theguardian.tv/interactive/2016/06/29/160629SusanDerges_h264_mezzanine_2M_H264.mp4",
        srcUrlWebm = "https://cdn.theguardian.tv/interactive/2016/06/29/160629SusanDerges_h264_mezzanine_2M_vp8.webm",
        srcUrlOgg = "https://cdn.theguardian.tv/interactive/mp4/1080/2016/06/29/160629SusanDerges_h264_mezzanine-1_lo" +
                    ".ogv",
        srcM3u8 = "https://cdn.theguardian.tv/interactive/2016/06/29/HLS/160629SusanDerges_h264_mezzanine.m3u8"
      ),
      cta,
      twitterShareText = Some("Leffe presents Slow Time: Still The River. Watch full film: "),
      nextPage = None
    )
  }

  private val quayBrothersPageWithoutNextPage: HostedVideoPage = {
    val videoTitle = "Slow Time: Quay Brothers"
    HostedVideoPage(
      campaign,
      pageUrl = s"$host/advertiser-content/${campaign.id}/$quayBrothersPageName",
      pageName = quayBrothersPageName,
      standfirst = "Leffe presents a film featuring influential stop-frame animators, Stephen and Timothy Quay, who " +
                   "give an insight into their unique appreciation of time.",
      video = HostedVideo(
        mediaId = quayBrothersPageName,
        title = videoTitle,
        duration = 134,
        posterUrl = Static("images/commercial/quay-brothers_poster.jpg"),
        srcUrlMp4 = "https://cdn.theguardian.tv/interactive/2016/06/29/160629QuayBrothers_V3_2M_H264.mp4",
        srcUrlWebm = "https://cdn.theguardian.tv/interactive/2016/06/29/160629QuayBrothers_V3_2M_vp8.webm",
        srcUrlOgg = "https://cdn.theguardian.tv/interactive/mp4/1080/2016/06/29/160629QuayBrothers_V3-3_hi.ogv",
        srcM3u8 = "https://cdn.theguardian.tv/interactive/2016/06/29/HLS/160629QuayBrothers_V3.m3u8"
      ),
      cta,
      twitterShareText = Some("Leffe presents Slow Time: Quay Brothers . Watch full film: "),
      nextPage = None
    )
  }

  private lazy val willardWiganPage = willardWiganPageWithoutNextPage
                                 .copy(nextPage = Some(adrienneTreebyPageWithoutNextPage))

  private lazy val adrienneTreebyPage = adrienneTreebyPageWithoutNextPage
                                   .copy(nextPage = Some(peteLawrencePageWithoutNextPage))

  private lazy val peteLawrencePage = peteLawrencePageWithoutNextPage
                                 .copy(nextPage = Some(susanDergesPageWithoutNextPage))

  private lazy val susanDergesPage = susanDergesPageWithoutNextPage
                                .copy(nextPage = Some(quayBrothersPageWithoutNextPage))

  private lazy val quayBrothersPage = quayBrothersPageWithoutNextPage
                                   .copy(nextPage = Some(willardWiganPageWithoutNextPage))

  def fromPageName(pageName: String): Option[HostedPage] = {
    pageName match {
      case `willardWiganPageName` if Switches.hostedLeffeShowVideo1.isSwitchedOn => Some(willardWiganPage)
      case `adrienneTreebyPageName` if Switches.hostedLeffeShowVideo1.isSwitchedOn => Some(adrienneTreebyPage)
      case `peteLawrencePageName` if Switches.hostedLeffeShowVideo1.isSwitchedOn => Some(peteLawrencePage)
      case `susanDergesPageName` if Switches.hostedLeffeShowVideo1.isSwitchedOn => Some(susanDergesPage)
      case `quayBrothersPageName` if Switches.hostedLeffeShowVideo1.isSwitchedOn => Some(quayBrothersPage)
      case _ => None
    }
  }
}
