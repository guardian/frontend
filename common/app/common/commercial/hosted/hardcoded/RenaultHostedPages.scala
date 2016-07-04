package common.commercial.hosted.hardcoded

import common.commercial.hosted._
import conf.Static

object RenaultHostedPages {

  private val teaserPageName = "design-competition-teaser"
  private val episode1PageName = "design-competition-episode1"
  private val episode2PageName = "design-competition-episode2"

  private val campaign = HostedCampaign(
    id = "renault-car-of-the-future",
    name = "Discover your Renault Zoe",
    owner = "Renault",
    logo = HostedLogo(Static("images/commercial/logo_renault.jpg"))
  )

  private val cta = HostedCallToAction(
    url = "https://www.renault.co.uk/vehicles/new-vehicles/zoe.html",
    label = "Discover Zoe",
    trackingCode = "explore-renault-zoe-button",
    bannerUrl = Static("images/commercial/ren_commercial_banner.jpg")
  )

  private val teaserWithoutNextPage: HostedVideoPage = HostedVideoPage(
    campaign,
    pageUrl = "https://www.theguardian.com/commercial/advertiser-content/renault-car-of-the-future/design-competition-teaser",
    pageName = teaserPageName,
    standfirst = "Who better to dream up the cars of tomorrow than the people who'll be buying them? Students at Central St Martins are working with Renault to design the interior for cars that will drive themselves. Watch this short video to find out more about the project, and visit this page again soon to catch up on the students' progress",
    video = HostedVideo(
      mediaId = "renault-car-of-the-future",
      title = "Designing the car of the future",
      duration = 86,
      posterUrl = Static("images/commercial/renault-video-poster.jpg"),
      srcUrlMp4 = "https://cdn.theguardian.tv/interactive/2016/05/17/160516GlabsTestSD_2M_H264.mp4",
      srcUrlWebm = "https://cdn.theguardian.tv/interactive/2016/05/17/160516GlabsTestSD_2M_vp8.webm",
      srcUrlOgg = "https://cdn.theguardian.tv/interactive/mp4/1080/2016/05/17/160516GlabsTestSD-3_hi.ogv",
      srcM3u8 = "https://cdn.theguardian.tv/interactive/2016/05/17/HLS/160516GlabsTestSD.m3u8"
    ),
    cta,
    nextPage = None
  )

  private val episode1WithoutNextPage: HostedVideoPage = HostedVideoPage(
    campaign,
    pageUrl = "https://www.theguardian.com/commercial/advertiser-content/renault-car-of-the-future/design-competition-episode1",
    pageName = episode1PageName,
    standfirst = "Renault challenged Central St Martins students to dream up the car of the future. The winning design will be announced at Clerkenwell Design Week (and on this site). Watch this short video to find out who made the shortlist",
    video = HostedVideo(
      mediaId = "renault-car-of-the-future",
      title = "Renault shortlists 'car of the future' designs",
      duration = 160,
      posterUrl = Static("images/commercial/renault-video-poster-ep1.jpg"),
      srcUrlMp4 = "https://cdn.theguardian.tv/interactive/2016/05/23/160523GlabsRenaultTestHD_2M_H264.mp4",
      srcUrlWebm = "https://cdn.theguardian.tv/interactive/2016/05/23/160523GlabsRenaultTestHD_2M_vp8.webm",
      srcUrlOgg = "https://cdn.theguardian.tv/interactive/mp4/1080/2016/05/23/160523GlabsRenaultTestHD-3_hi.ogv",
      srcM3u8 = "https://cdn.theguardian.tv/interactive/2016/05/23/HLS/160523GlabsRenaultTestHD.m3u8"
    ),
    cta,
    nextPage = None
  )

  private val episode2WithoutNextPage: HostedVideoPage = HostedVideoPage(
    campaign,
    pageUrl = "https://www.theguardian.com/commercial/advertiser-content/renault-car-of-the-future/design-competition-episode2",
    pageName = episode2PageName,
    standfirst = "A group of Central St Martins students took part in a competition to dream up the car of the future. The winning design is radical and intriguing. Meet the team whose blue-sky thinking may have created a blueprint for tomorrow's autonomous cars",
    video = HostedVideo(
      mediaId = "renault-car-of-the-future",
      title = "Is this the car of the future?",
      duration = 158,
      posterUrl = Static("images/commercial/renault-video-poster-ep2.jpg"),
      srcUrlMp4 = "https://cdn.theguardian.tv/interactive/2016/06/03/160603GlabsRenaultTest3_2M_H264.mp4",
      srcUrlWebm = "https://cdn.theguardian.tv/interactive/2016/06/03/160603GlabsRenaultTest3_2M_vp8.webm",
      srcUrlOgg = "https://cdn.theguardian.tv/interactive/mp4/1080/2016/06/03/160603GlabsRenaultTest3-3_hi.ogv",
      srcM3u8 = "https://cdn.theguardian.tv/interactive/2016/06/03/HLS/160603GlabsRenaultTest3.m3u8"
    ),
    cta,
    nextPage = None
  )

  private val teaser: HostedVideoPage = teaserWithoutNextPage.copy(nextPage = Some(episode1WithoutNextPage))

  private val episode1: HostedVideoPage = episode1WithoutNextPage.copy(nextPage = Some(episode2WithoutNextPage))

  private val episode2: HostedVideoPage = episode2WithoutNextPage.copy(nextPage = Some(episode1WithoutNextPage))

  def fromPageName(pageName: String): Option[HostedPage] = {
    pageName match {
      case `teaserPageName` => Some(teaser)
      case `episode1PageName` => Some(episode1)
      case `episode2PageName` => Some(episode2)
      case _ => None
    }
  }
}
