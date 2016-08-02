package common.commercial.hosted.hardcoded

import common.commercial.hosted._
import conf.Configuration.site.host
import conf.Static
import conf.switches.Switches

object Formula1HostedPages {

  private val campaign = HostedCampaign(
    id = "singapore-grand-prix",
    name = "Singapore Grand Prix",
    owner = "First Stop Singapore",
    logo = HostedLogo("https://static.theguardian.com/commercial/hosted/formula1-singapore/2016_TrackLogo_RGB_FullColour.png"),
    cssClass = "f1-singapore"
  )

  private val cta = HostedCallToAction(
    url = "https://www.firststopsingapore.com/singapore-airlines-singapore-grand-prix-packages/?utm_source=guardian&utm_medium=editorial&utm_campaign=singaporegrandprix",
    image = "https://static.theguardian.com/commercial/hosted/formula1-singapore/SGPGuardianImage.jpg",
    label = "Discover the 2016 Singapore Grand Prix",
    trackingCode = "singapore-grand-prix",
    btnText = "Book now"
  )

  val overviewPageName = "overview"
  val packagesPageName = "packages"
  val offtrackPageName = "offtrack"

  val overviewArticlePage = HostedArticlePage2(
    campaign,
    pageUrl = s"$host/advertiser-content/${campaign.id}/$overviewPageName",
    pageName = overviewPageName,
    title = "Overview",
    standfirst = "Singapore has been the proud host of the world's only Formula One night race since 2008. The backdrop of heritage buildings, modern architecture and breathtaking skyline culminates in an unparalleled combination of sights, sounds and a festive atmosphere.",
    cta,
    mainPicture = "http://media.guim.co.uk/18ad0d659d2cf5b961b7c7c9548283cc6e4559e1/0_346_5184_3110/2000.jpg",
    mainPictureCaption = "A bird's eye view of the illuminated Marina Bay Street Circuit"
  )

  val packagesArticlePage = HostedArticlePage2(
    campaign,
    pageUrl = s"$host/advertiser-content/${campaign.id}/$packagesPageName",
    pageName = packagesPageName,
    title = "Packages",
    standfirst = "Singapore has been the proud host of the world's only Formula One night race since 2008. The backdrop of heritage buildings, modern architecture and breathtaking skyline culminates in an unparalleled combination of sights, sounds and a festive atmosphere.",
    cta,
    mainPicture = "http://media.guim.co.uk/7570a34e5556dfdaeb17af6bee54168c0c9bdc15/0_0_4240_2832/2000.jpg",
    mainPictureCaption = "Crowd along the Jubilee Bridge, an excellent vantage point of the fireworks display on Sunday "
  )

  val offtrackArticlePage = HostedArticlePage2(
    campaign,
    pageUrl = s"$host/advertiser-content/${campaign.id}/$offtrackPageName",
    pageName = offtrackPageName,
    title = "Offtrack",
    standfirst = "Singapore has been the proud host of the world's only Formula One night race since 2008. The backdrop of heritage buildings, modern architecture and breathtaking skyline culminates in an unparalleled combination of sights, sounds and a festive atmosphere.",
    cta,
    mainPicture = "http://media.guim.co.uk/797e2c3ecf6631e647f31978073404e1b78974a7/0_0_5184_3456/2000.jpg",
    mainPictureCaption = "Take a break from the action and cool off within the Circuit Park"
  )

  def fromPageName(pageName: String): Option[HostedPage] = {
    pageName match {
      case `overviewPageName` if Switches.hostedSingaporeF1Article.isSwitchedOn => Some(overviewArticlePage)
      case `packagesPageName` if Switches.hostedSingaporeF1Article.isSwitchedOn => Some(packagesArticlePage)
      case `offtrackPageName` if Switches.hostedSingaporeF1Article.isSwitchedOn => Some(offtrackArticlePage)
      case _ => None
    }
  }
}
