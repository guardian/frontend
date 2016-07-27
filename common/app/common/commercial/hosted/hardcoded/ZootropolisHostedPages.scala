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

  private val videoPage: HostedVideoPage = {
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
    conArtistPic = "https://media.guim.co.uk/f57ea457837fcae4f77bb31d1b997af1fd158aed/947_0_1869_2380/393.png",
    conArtistPoster = Static("images/commercial/con-artist-poster.png"),
    rookiePic = "https://media.guim.co.uk/6079f37ef66a544b745087606ef987a72a0b6982/71_0_1123_1730/325.png",
    rookiePoster = Static("images/commercial/rookie-poster.png"),
    chiefPic = "https://media.guim.co.uk/5e2f2703d753bd2c532d443d55dd9b0e325b4087/58_12_1367_1716/398.png",
    chiefPoster = Static("images/commercial/chief-poster.png"),
    slothPic = "https://media.guim.co.uk/09bd9dda35d757fdfedf6e626226c656dfe4db20/0_49_1650_1340/500.png",
    slothPoster = Static("images/commercial/sloth-poster.png"),
    deskClerkPic = "https://media.guim.co.uk/223857a17c0446397a53075cadb66c7179fb83ee/0_0_1476_1575/937.png",
    deskClerkPoster = Static("images/commercial/desk-clerk-poster.png"),
    gazellePic = "https://media.guim.co.uk/fca2bfbba8424cb98340dd5d841fbd25be383a5d/0_0_1156_1435/806.png",
    gazellePoster = Static("images/commercial/popstar-poster.png")
  )

  val articlePageName = "meet-the-characters-of-zootropolis"

  val articlePage = HostedArticlePage(
    campaign,
    pageUrl = s"$host/advertiser-content/${campaign.id}/$articlePageName",
    pageName = articlePageName,
    pageTitle = "Advertiser content hosted by the Guardian: Disney Zootropolis",
    standfirst = "Hosted content is used to describe content that is paid for and supplied by the advertiser. Find out more with our",
    standfirstLink = "commercial content explainer.",
    facebookImageUrl = Static("images/commercial/zootropolis.png"),
    cta,
    ctaBanner = "https://static.theguardian.com/commercial/hosted/disney-zootropolis/zootropolis_banner.jpg",
    mainPicture = "https://media.guim.co.uk/cb60581783874e022209cde845481bd4334cb7a0/0_116_1300_385/1300.png",
    twitterTxt = "Disney Zootropolis asset pack on the Guardian #ad",
    emailTxt = "Disney Zootropolis asset pack on the Guardian",
    customData
  )

  def fromPageName(pageName: String): Option[HostedPage] = {
    pageName match {
      case `articlePageName` if Switches.hostedArticle.isSwitchedOn => Some(articlePage)
      case `videoPageName` if Switches.hostedVideoDisneyZootropolis.isSwitchedOn => Some(videoPage)
      case _ => None
    }
  }
}
