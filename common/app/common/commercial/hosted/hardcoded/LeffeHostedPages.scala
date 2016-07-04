package common.commercial.hosted.hardcoded

import common.commercial.hosted._
import conf.Static
import conf.switches.Switches

object LeffeHostedPages {

  private val vid1PageName = "vid1"

  private val campaign = HostedCampaign(
    id = "TODO",
    name = "TODO",
    owner = "Leffe",
    logo = HostedLogo(Static("images/commercial/TODO.jpg"))
  )

  private val vid1: HostedVideoPage = HostedVideoPage(
    campaign,
    pageUrl = "TODO",
    pageName = vid1PageName,
    standfirst = "TODO",
    bannerUrl = Static("TODO"),
    video = HostedVideo(
      mediaId = "TODO",
      title = "TODO",
      duration = -1,
      posterUrl = Static("TODO"),
      srcUrlMp4 = "TODO",
      srcUrlWebm = "TODO",
      srcUrlOgg = "TODO",
      srcM3u8 = "TODO"
    ),
    cta = HostedCallToAction(
      url = "TODO",
      label = "TODO",
      trackingCode = "TODO"
    ),
    nextPage = None
  )

  def fromPageName(pageName: String): Option[HostedPage] = {
    pageName match {
      case `vid1PageName` if Switches.hostedLeffeShowVideo1.isSwitchedOn => Some(vid1)
      case _ => None
    }
  }
}
