package common.commercial.hosted.hardcoded

import common.commercial.hosted.{HostedPage, HostedVideo, HostedVideoPage}
import conf.Static
import conf.switches.Switches

object LeffeHostedPages {

  private val vid1PageName = "vid1"

  private val vid1: HostedVideoPage = HostedVideoPage(
    sectionId = "TODO",
    pageUrl = "TODO",
    pageName = vid1PageName,
    standfirst = "TODO",
    logoUrl = Static("TODO"),
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
    nextPage = None,
    owner = "Leffe"
  )

  def fromPageName(pageName: String): Option[HostedPage] = {
    pageName match {
      case `vid1PageName` if Switches.hostedLeffeShowVideo1.isSwitchedOn => Some(vid1)
      case _ => None
    }
  }
}
