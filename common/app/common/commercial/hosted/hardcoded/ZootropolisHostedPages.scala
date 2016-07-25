package common.commercial.hosted.hardcoded

import common.commercial.hosted._
import conf.Configuration.site.host
import conf.Static
import conf.switches.Switches

object ZootropolisHostedPages {

  private val videoPageName = "video"

  private val campaign = HostedCampaign(
    id = "disney-zootropolis",
    name = "Zootropolis",
    owner = "Disney",
    logo = HostedLogo("https://static.theguardian.com/commercial/hosted/disney-zootropolis/zootropolis-logo.jpg"),
    cssClass = "zootropolis"
  )

  private val cta = HostedCallToAction(
    url = "http://bfy.tw/6qk7",
    label = "",
    trackingCode = "disney-zootropolis",
    btnText = "Out now on digital download"
  )

  private val videoPageWithoutNextPage: HostedVideoPage = {
    val videoTitle = "Disney’s’ Zootropolis: Download & keep today!"
    HostedVideoPage(
      campaign,
      pageUrl = s"$host/advertiser-content/${campaign.id}/$videoPageName",
      pageName = videoPageName,
      standfirst = "The residents of Zootropolis are leading the charge on Digital Download! " +
        "Don’t let the sloths slow you down – download instantly through Sky Store, " +
        "the fastest way to bring your favourite characters home!",
      video = HostedVideo(
        mediaId = videoPageName,
        title = videoTitle,
        duration = 32,
        posterUrl = "https://static.theguardian.com/commercial/hosted/disney-zootropolis/ZOO_1132_130_0_009_00_0091.jpg",
        srcUrlMp4 = "https://cdn.theguardian.tv/interactive/2016/07/18/160718GLZootropolisSpot_h264_mezzanine_2M_H264.mp4",
        srcUrlWebm = "https://cdn.theguardian.tv/interactive/2016/07/18/160718GLZootropolisSpot_h264_mezzanine_2M_vp8.webm",
        srcUrlOgg = "https://cdn.theguardian.tv/interactive/mp4/1080/2016/07/18/160718GLZootropolisSpot_h264_mezzanine-1_lo.ogv",
        srcM3u8 = "https://cdn.theguardian.tv/interactive/2016/07/18/HLS/160718GLZootropolisSpot_h264_mezzanine.m3u8"
      ),
      cta,
      ctaBanner = "https://static.theguardian.com/commercial/hosted/disney-zootropolis/zootropolis_banner.jpg",
      twitterTxt = videoTitle,
      emailTxt = videoTitle,
      nextPage = None
    )
  }

  val customData = CustomData(
    conArtistPic = Static("images/commercial/con-artist.png"),
    conArtistPoster = Static("images/commercial/con-artist-poster.png"),
    rookiePic = Static("images/commercial/rookie.png"),
    rookiePoster = Static("images/commercial/rookie-poster.png"),
    chiefPic = Static("images/commercial/chief.png"),
    chiefPoster = Static("images/commercial/chief-poster.png"),
    slothPic = Static("images/commercial/sloth.png"),
    slothPoster = Static("images/commercial/sloth-poster.png"),
    deskClerkPic = Static("images/commercial/desk-clerk.png"),
    deskClerkPoster = Static("images/commercial/desk-clerk-poster.png"),
    gazellePic = Static("images/commercial/popstar.png"),
    gazellePoster = Static("images/commercial/popstar-poster.png")
  )

  val articlePageName = "meet-the-characters-of-zootropolis"

  val articlePage = HostedArticlePage(
    campaign,
    pageUrl = s"$host/advertiser-content/${campaign.id}/$articlePageName",
    pageName = articlePageName,
    title = "Meet the characters of Zootropolis",
    standfirst = "Hosted content is used to describe content that is paid for and supplied by the advertiser. Find out more with our",
    standfirstLink = "commercial content explainer.",
    facebookImageUrl = Static("images/commercial/zootropolis.png"),
    cta,
    ctaBanner = Static("images/commercial/zootropolis-banner.png"),
    mainPicture = Static("images/commercial/zootropolis.png"),
    twitterTxt = "Disney Zootropolis asset pack on the Guardian #ad",
    emailTxt = "Disney Zootropolis asset pack on the Guardian",
    customData
  )


  private lazy val videoPage = if (Switches.hostedArticle.isSwitchedOn) videoPageWithoutNextPage
    .copy(nextPage = Some(articlePage)) else videoPageWithoutNextPage

  def fromPageName(pageName: String): Option[HostedPage] = {
    pageName match {
      case `articlePageName` if Switches.hostedArticle.isSwitchedOn => Some(articlePage)
      case `videoPageName` if Switches.hostedVideoDisneyZootropolis.isSwitchedOn => Some(videoPage)
      case _ => None
    }
  }
}
