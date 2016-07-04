package common.commercial.hosted.hardcoded

import common.commercial.hosted._
import conf.Configuration.site.host
import conf.Static
import conf.switches.Switches

object LeffeHostedPages {


  /*
    Pete Lawrence
    http://multimedia.guardianapis.com/interactivevideos/video
    .php?file=160629GLPeteLawrence_h264_mezzanine&format=video/webm&maxbitrate=2048

    Susan Derges
    http://multimedia.guardianapis.com/interactivevideos/video
    .php?file=160629GLSusanDerges_h264_mezzanine&format=video/webm&maxbitrate=2048

    Quay Brothers
    http://multimedia.guardianapis.com/interactivevideos/video
    .php?file=160629GLQuayBrothers_h264_mezzanine&format=video/webm&maxbitrate=2048
  */


  private val willardWiganPageName = "willard-wigan"
  private val adrienneTreebyPageName = "adrienne-treeby"

  private val campaign = HostedCampaign(
    id = "leffe-rediscover-time",
    name = "Leffe - rediscover time",
    owner = "Leffe",
    logo = HostedLogo(Static("images/commercial/TODO.jpg"))
  )

  private val willardWiganPageWithoutNextPage: HostedVideoPage = HostedVideoPage(
    campaign,
    pageUrl = s"$host/advertiser-content/${campaign.id}/$willardWiganPageName",
    pageName = willardWiganPageName,
    standfirst = "TODO",
    bannerUrl = Static("TODO"),
    video = HostedVideo(
      mediaId = willardWiganPageName,
      title = "Willard Wigan",
      duration = 127,
      posterUrl = Static("TODO"),
      srcUrlMp4 = "https://cdn.theguardian.tv/interactive/2016/06/29/160629WillardWigan_V3_2M_H264.mp4",
      srcUrlWebm = "https://cdn.theguardian.tv/interactive/2016/06/29/160629WillardWigan_V3_2M_vp8.webm",
      srcUrlOgg = "https://cdn.theguardian.tv/interactive/mp4/1080/2016/06/29/160629WillardWigan_V3_hi.ogv",
      srcM3u8 = "https://cdn.theguardian.tv/interactive/2016/06/29/HLS/160629WillardWigan_V3.m3u8"
    ),
    cta = HostedCallToAction(
      url = "TODO",
      label = "TODO",
      trackingCode = "TODO"
    ),
    nextPage = None
  )

  private val adrienneTreebyPageWithoutNextPage: HostedVideoPage = HostedVideoPage(
    campaign,
    pageUrl = s"$host/advertiser-content/${campaign.id}/$adrienneTreebyPageName",
    pageName = adrienneTreebyPageName,
    standfirst = "TODO",
    bannerUrl = Static("TODO"),
    video = HostedVideo(
      mediaId = adrienneTreebyPageName,
      title = "Adrienne Treeby",
      duration = 116,
      posterUrl = Static("TODO"),
      srcUrlMp4 = "https://cdn.theguardian" +
                  ".tv/interactive/2016/06/29/160629AdrienneTreeby_KP-28311272_h264_mezzanine_2M_H264.mp4",
      srcUrlWebm = "https://cdn.theguardian" +
                   ".tv/interactive/2016/06/29/160629AdrienneTreeby_KP-28311272_h264_mezzanine_2M_vp8.webm",
      srcUrlOgg = "https://cdn.theguardian" +
                  ".tv/interactive/mp4/1080/2016/06/29/160629AdrienneTreeby_KP-28311272_h264_mezzanine_hi.ogv",
      srcM3u8 = "https://cdn.theguardian" +
                ".tv/interactive/2016/06/29/HLS/160629AdrienneTreeby_KP-28311272_h264_mezzanine.m3u8"
    ),
    cta = HostedCallToAction(
      url = "TODO",
      label = "TODO",
      trackingCode = "TODO"
    ),
    nextPage = None
  )

  private val willardWiganPage = willardWiganPageWithoutNextPage
                                 .copy(nextPage = Some(adrienneTreebyPageWithoutNextPage))

  private val adrienneTreebyPage = adrienneTreebyPageWithoutNextPage
                                   .copy(nextPage = Some(willardWiganPageWithoutNextPage))

  def fromPageName(pageName: String): Option[HostedPage] = {
    pageName match {
      case `willardWiganPageName` if Switches.hostedLeffeShowVideo1.isSwitchedOn => Some(willardWiganPage)
      case `adrienneTreebyPageName` if Switches.hostedLeffeShowVideo1.isSwitchedOn => Some(adrienneTreebyPage)
      case _ => None
    }
  }
}
