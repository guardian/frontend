package common.commercial.hosted.hardcoded

import common.commercial.hosted._
import conf.Configuration.site.host

object ZootropolisHostedPages {

  private val videoPageName = "video"

  private val campaign = HostedCampaign(
    id = "disney-zootropolis",
    name = "Zootropolis",
    owner = "Disney",
    logo = HostedLogo("https://static.theguardian.com/commercial/hosted/disney-zootropolis/zootropolis-logo.jpg"),
    fontColour = FontColour("#2ec869")
  )

  private val cta = HostedCallToAction(
    url = "https://ad.doubleclick.net/ddm/clk/307882423;133964630;h",
    image = Some("https://static.theguardian.com/commercial/hosted/disney-zootropolis/zootropolis_cta.jpg"),
    trackingCode = Some("disney-zootropolis"),
    btnText = Some("Out now on digital download"),
    label = None
  )

  private lazy val videoPageWithoutNextPage: HostedVideoPage = {
    val pageUrl = s"$host/advertiser-content/${campaign.id}/$videoPageName"
    val pageName = videoPageName
    val standfirst = "The residents of Zootropolis are leading the charge on Digital Download! " +
                     "Don’t let the sloths slow you down – download instantly through Sky Store, " +
                     "the fastest way to bring your favourite characters home!"
    val videoTitle = "Disney’s Zootropolis: Download and keep today!"
    val video = HostedVideo(
      mediaId = videoPageName,
      title = videoTitle,
      duration = 32,
      posterUrl = "https://static.theguardian.com/commercial/hosted/disney-zootropolis/ZOO_1132_130_0_009_00_0091.jpg",
      srcUrlMp4 = "https://cdn.theguardian.tv/interactive/2016/07/18/160718GLZootropolisSpot_h264_mezzanine_2M_H264" +
                  ".mp4",
      srcUrlWebm = "https://cdn.theguardian.tv/interactive/2016/07/18/160718GLZootropolisSpot_h264_mezzanine_2M_vp8" +
                   ".webm",
      srcUrlOgg = "https://cdn.theguardian.tv/interactive/mp4/1080/2016/07/18/160718GLZootropolisSpot_h264_mezzanine" +
                  "-1_lo.ogv",
      srcM3u8 = "https://cdn.theguardian.tv/interactive/2016/07/18/HLS/160718GLZootropolisSpot_h264_mezzanine.m3u8"
    )
    HostedVideoPage(
      campaign,
      pageUrl,
      pageName,
      standfirst,
      video,
      cta,
      socialShareText = None,
      shortSocialShareText = Some(
        "Get to know the residents of Zootropolis and find out where to download the film instantly"
      ),
      metadata = Metadata.forHardcodedHostedVideoPage(campaign, video, pageUrl, pageName, standfirst)
    )
  }

  private lazy val customData = CustomData(
    conArtistPic = "https://media.guim.co.uk/f57ea457837fcae4f77bb31d1b997af1fd158aed/947_0_1869_2380/393.png",
    conArtistPoster = "https://static.theguardian.com/commercial/hosted/disney-zootropolis/zoo-test.png",
    rookiePic = "https://media.guim.co.uk/6079f37ef66a544b745087606ef987a72a0b6982/71_0_1123_1730/325.png",
    rookiePoster = "https://static.theguardian.com/commercial/hosted/disney-zootropolis/bunny.png",
    chiefPic = "https://media.guim.co.uk/5e2f2703d753bd2c532d443d55dd9b0e325b4087/58_12_1367_1716/398.png",
    chiefPoster = "https://static.theguardian.com/commercial/hosted/disney-zootropolis/bull.png",
    slothPic = "https://media.guim.co.uk/09bd9dda35d757fdfedf6e626226c656dfe4db20/0_49_1650_1340/500.png",
    slothPoster = "https://static.theguardian.com/commercial/hosted/disney-zootropolis/sloth.png",
    deskClerkPic = "https://media.guim.co.uk/223857a17c0446397a53075cadb66c7179fb83ee/0_0_1476_1575/937.png",
    deskClerkPoster = "https://static.theguardian.com/commercial/hosted/disney-zootropolis/cat.png",
    gazellePic = "https://media.guim.co.uk/fca2bfbba8424cb98340dd5d841fbd25be383a5d/0_0_1156_1435/806.png",
    gazellePoster = "https://static.theguardian.com/commercial/hosted/disney-zootropolis/gazelle.png",
    posterPdf = "https://static.theguardian.com/commercial/hosted/disney-zootropolis/CharactersZootropolis.pdf",
    colouringPdf = "https://static.theguardian.com/commercial/hosted/disney-zootropolis/ColoringZootropolis.pdf"
  )

  private lazy val articlePageName = "meet-the-characters-of-zootropolis"

  private lazy val articlePageWithoutNextPage = ZootropolisPage(
    campaign,
    pageUrl = s"$host/advertiser-content/${campaign.id}/$articlePageName",
    pageName = articlePageName,
    title = "Meet the characters of Zootropolis",
    standfirst = "Hosted content is used to describe content that is paid for and supplied by the advertiser. Find out more with our",
    standfirstLink = "commercial content explainer.",
    facebookImageUrl = "https://media.guim.co.uk/cb60581783874e022209cde845481bd4334cb7a0/0_116_1300_385/1300.png",
    cta,
    ctaBanner = "https://static.theguardian.com/commercial/hosted/disney-zootropolis/zootropolis_cta.jpg",
    mainPicture = "https://media.guim.co.uk/cb60581783874e022209cde845481bd4334cb7a0/0_116_1300_385/1300.png",
    socialShareText = Some("Get to know the colourful characters of Disney’s Zootropolis with these printable colouring-in sheets and " +
                           "character posters! Zootropolis is packed with snappy action, witty dialogue & belly laughs.  It’s an adorable movie that shouldn’t be missed." +
                           " Download instantly with Sky Store & get the DVD in the post (no Sky subscription required)!"),
    shortSocialShareText = Some("Get to know the residents of Zootropolis and find out where to download the film instantly"),
    customData = customData
  )


  private def withNextPage(hostedPage: HostedVideoPage, newPage: HostedPage): HostedPage = {
    hostedPage.copy(nextPage = Some(NextHostedPage(imageUrl = newPage.imageUrl, pageUrl = newPage.pageUrl, title = newPage.title, contentType = newPage.contentType)))
  }

  private lazy val videoPage = withNextPage(videoPageWithoutNextPage, articlePageWithoutNextPage)

  private lazy val articlePage = articlePageWithoutNextPage.copy(nextPage = Some(videoPageWithoutNextPage))

  def fromPageName(pageName: String): Option[HostedPage] = {
    pageName match {
      case `articlePageName` => Some(articlePage)
      case `videoPageName` => Some(videoPage)
      case _ => None
    }
  }
}
