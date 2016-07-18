package common.commercial.hosted.hardcoded

import common.commercial.hosted._
import conf.Configuration.site.host
import conf.switches.Switches

// todo rename
object ArticleCampaign {

  val campaign = HostedCampaign(
    id = "article-campaign",
    name = "Name of the campaign here",
    owner = "TODO",
    logo = HostedLogo("TODO"),
    cssClass = "TODO"
  )

  val articlePageName = "hosted-article"

  val hostedArticlePage = HostedArticlePage(
    campaign,
    pageUrl = s"$host/advertiser-content/${campaign.id}/$articlePageName",
    pageName = articlePageName,
    pageTitle = "Advertiser content hosted by the Guardian: some title here",
    standfirst = "TODO",
    facebookImageUrl = "TODO"
  )

  def fromPageName(pageName: String): Option[HostedPage] = {
    pageName match {
      case `articlePageName` if Switches.hostedArticle.isSwitchedOn => Some(hostedArticlePage)
      case _ => None
    }
  }
}
