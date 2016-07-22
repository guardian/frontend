package common.commercial.hosted.hardcoded

import common.commercial.hosted._
import conf.Configuration.site.host
import conf.switches.Switches
import conf.Static

object ZootropolisCampaign {

  val campaign = HostedCampaign(
    id = "article-campaign",
    name = "Zootropolis",
    owner = "Disney",
    logo = HostedLogo(Static("images/commercial/zootropolis-logo.png")),
    cssClass = "zootropolis"
  )

  val cta = HostedCallToAction(
    url = "TODO",
    label = "The Zootropolis Activity pack",
    trackingCode = "TODO",
    btnText = "Download now"
  )

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

  val articlePageName = "hosted-article"

  val hostedArticlePage = HostedArticlePage(
    campaign,
    pageUrl = s"$host/advertiser-content/${campaign.id}/$articlePageName",
    pageName = articlePageName,
    pageTitle = "Advertiser content hosted by the Guardian: some title here",
    standfirst = "Hosted content is used to describe content that is paid for and supplied by the advertiser. Find out more with our",
    standfirstLink = "commercial content explainer.",
    facebookImageUrl = "TODO",
    cta,
    ctaBanner = Static("images/commercial/zootropolis-banner.png"),
    mainPicture = Static("images/commercial/zootropolis.png"),
    twitterTxt = "TODO  #ad: ",
    emailTxt = "TODO",
    customData
  )

  def fromPageName(pageName: String): Option[HostedPage] = {
    pageName match {
      case `articlePageName` if Switches.hostedArticle.isSwitchedOn => Some(hostedArticlePage)
      case _ => None
    }
  }
}
