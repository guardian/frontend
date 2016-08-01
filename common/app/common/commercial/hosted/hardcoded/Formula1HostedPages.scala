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
    label = "Sort your flights, hotel and GP ticket for less at",
    trackingCode = "singapore-grand-prix",
    btnText = "sianightrace.com"
  )

  val overviewPageName = "overview"
  val packagesPageName = "packages"
  val offtrackPageName = "offtrack"

  val overviewArticlePage = HostedArticlePage2(
    campaign,
    pageUrl = s"$host/advertiser-content/${campaign.id}/$overviewPageName",
    pageName = overviewPageName,
    title = "Get revved up for the Singapore Grand Prix",
    standfirst = "‘This race is always a highlight of the season: a great city, which looks really spectacular under the lights with the tricky street circuit below – my favourite kind of track to drive.’ Lewis Hamilton, 3-time Formula1 World Champion, Mercedes AMG Petronas F1 Team",
    cta,
    mainPicture = "http://media.guim.co.uk/18ad0d659d2cf5b961b7c7c9548283cc6e4559e1/0_346_5184_3110/2000.jpg",
    mainPictureCaption = "A bird's eye view of the illuminated Marina Bay Street Circuit"
  )

  val packagesArticlePage = HostedArticlePage2(
    campaign,
    pageUrl = s"$host/advertiser-content/${campaign.id}/$packagesPageName",
    pageName = packagesPageName,
    title = "Singapore Airlines Singapore Grand Prix packages",
    standfirst = "‘This is such a special race. The whole weekend feels different – there’s a buzz to the F1 Paddock when you first walk in on Thursday afternoon and it never goes away. You can feel the vibe – and the tension and anticipation climb higher and higher as we get closer to the race itself on Sunday night.’ Jenson Button, 2009 Formula 1 World Champion, McLaren-Honda",
    cta,
    mainPicture = "http://media.guim.co.uk/7570a34e5556dfdaeb17af6bee54168c0c9bdc15/0_0_4240_2832/2000.jpg",
    mainPictureCaption = "Crowd along the Jubilee Bridge, an excellent vantage point of the fireworks display on Sunday "
  )

  val offtrackArticlePage = HostedArticlePage2(
    campaign,
    pageUrl = s"$host/advertiser-content/${campaign.id}/$offtrackPageName",
    pageName = offtrackPageName,
    title = "Get the most out of the Singapore Grand Prix",
    standfirst = "‘Singapore is definitely one of the highlights of the year. There’s an amazing atmosphere and the\nwhole city really comes to life for the race weekend. It’s just unreal – I would really recommend\nanybody to come because it’s a fantastic experience. The circuit, the city, the atmosphere –\neverything!’ Nico Rosberg, Formula 1 driver, Mercedes AMG Petronas F1 Team",
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
