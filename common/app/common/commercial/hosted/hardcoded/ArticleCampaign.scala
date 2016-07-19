package common.commercial.hosted.hardcoded

import common.commercial.hosted._
import conf.Configuration.site.host
import conf.switches.Switches
import conf.Static

// todo rename
object ArticleCampaign {

  val campaign = HostedCampaign(
    id = "article-campaign",
    name = "Name of the campaign here",
    owner = "TODO",
    logo = HostedLogo("TODO"),
    cssClass = "zootropolis"
  )

  val cta = HostedCallToAction(
    url = "TODO",
    label = "Lorem ipsum",
    trackingCode = "TODO",
    btnText = "Lorem!"
  )

  val articlePageName = "hosted-article"

  val hostedArticlePage = HostedArticlePage(
    campaign,
    pageUrl = s"$host/advertiser-content/${campaign.id}/$articlePageName",
    pageName = articlePageName,
    pageTitle = "Advertiser content hosted by the Guardian: some title here",
    standfirst = "TODO",
    facebookImageUrl = "TODO",
    cta,
    ctaBanner = Static("images/commercial/leffe_banner.png"),
    mainPicture = Static("images/commercial/leffe_banner.png"),
    twitterTxt = "TODO  #ad: ",
    emailTxt = "TODO"
  )

  def fromPageName(pageName: String): Option[HostedPage] = {
    pageName match {
      case `articlePageName` if Switches.hostedArticle.isSwitchedOn => Some(hostedArticlePage)
      case _ => None
    }
  }
}
