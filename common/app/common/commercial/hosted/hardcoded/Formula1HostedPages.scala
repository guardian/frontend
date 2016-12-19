package common.commercial.hosted.hardcoded

import common.commercial.Dimensions
import common.commercial.hosted._

object Formula1HostedPages {

  private val campaign = HostedCampaign(
    id = "singapore-grand-prix",
    name = "Singapore Grand Prix",
    owner = "First Stop Singapore",
    logo = HostedLogo(
      "https://static.theguardian.com/commercial/hosted/formula1-singapore/Logos-SGP-SA-1.jpg",
      Some(Dimensions(width = 500, height = 500)),
      trackingCode = ""
    ),
    fontColour = Colour("#063666")
  )

  private def cta(pageName: String) = HostedCallToAction(
    url = "https://www.firststopsingapore.com/singapore-airlines-singapore-grand-prix-packages/?utm_source=guardian&utm_medium=editorial&utm_campaign=singaporegrandprix",
    image = Some("https://static.theguardian.com/commercial/hosted/formula1-singapore/SGPGuardianImage.jpg"),
    label = Some("Discover the 2016 Singapore Grand Prix"),
    trackingCode = Some(s"singapore-grand-prix:$pageName"),
    btnText = Some("Book now")
  )

  val overviewPageName = "overview"
  val packagesPageName = "packages"
  val offtrackPageName = "offtrack"

  val overviewArticlePage = {
    val id = s"advertiser-content/${campaign.id}/$overviewPageName"
    val pageName = overviewPageName
    val title = "Get revved up for the Singapore Grand Prix"
    val standfirst = "‘This race is always a highlight of the season: a great city, which looks really spectacular " +
                     "under the lights with the tricky street circuit below – my favourite kind of track to drive.' " +
                     "Lewis Hamilton, 3-time Formula1 World Champion, Mercedes AMG Petronas F1 Team"
    val mainPicture = "https://media.guim.co.uk/18ad0d659d2cf5b961b7c7c9548283cc6e4559e1/0_346_5184_3110/2000.jpg"
    HostedArticlePage(
      id,
      campaign,
      pageName = pageName,
      title = title,
      standfirst = standfirst,
      body = "",
      cta(overviewPageName),
      nextPageNames = List(packagesPageName, offtrackPageName),
      mainPicture = mainPicture,
      mainPictureCaption = "A bird's eye view of the illuminated Marina Bay Street Circuit",
      socialShareText = None,
      shortSocialShareText = None,
      metadata = Metadata.forHardcodedHostedArticlePage(id, campaign, pageName, title, standfirst, mainPicture)
    )
  }

  val packagesArticlePage = {
    val id = s"advertiser-content/${campaign.id}/$packagesPageName"
    val pageName = packagesPageName
    val title = "Singapore Airlines Singapore Grand Prix packages"
    val standfirst = "'This is such a special race. The whole weekend feels\n\ndifferent – there's a buzz to the F1 " +
                 "Paddock when you first walk in on Thursday afternoon \n\nand it never goes away.' Jenson Button, 2009 Formula 1 World Champion, McLaren-Honda"
    val mainPicture = "https://media.guim.co.uk/5dfce3ee95c325437fd26d1757a5a9032c514400/0_0_3008_1997/2000.jpg"
    HostedArticlePage(
      id,
      campaign,
      pageName = pageName,
      title = title,
      standfirst = standfirst,
      body = "",
      cta(packagesPageName),
      nextPageNames = List(offtrackPageName, overviewPageName),
      mainPicture = mainPicture,
      mainPictureCaption = "",
      socialShareText = None,
      shortSocialShareText = None,
      metadata = Metadata.forHardcodedHostedArticlePage(id, campaign, pageName, title, standfirst, mainPicture)
    )
  }

  val offtrackArticlePage = {
    val id = s"advertiser-content/${campaign.id}/$offtrackPageName"
    val pageName = offtrackPageName
    val title = "Get the most out of the Singapore Grand Prix"
    val standfirst = "'Singapore is definitely one of the highlights of the\n\nyear. There's an amazing atmosphere and " +
                     "the whole city really comes to life for the race \n\nweekend. It's just unreal – I would really" +
                     " " +
                     "recommend anybody to come because it's a \n\nfantastic experience.' Nico Rosberg, Formula 1 " +
                     "driver, Mercedes AMG Petronas F1 Team"
    val mainPicture = "https://media.guim.co.uk/797e2c3ecf6631e647f31978073404e1b78974a7/0_0_5184_3456/2000.jpg"
    HostedArticlePage(
      id,
      campaign,
      pageName = pageName,
      title = title,
      standfirst = standfirst,
      body = "",
      cta(offtrackPageName),
      nextPageNames = List(overviewPageName, packagesPageName),
      mainPicture = mainPicture,
      mainPictureCaption = "Take a break from the action and cool off within the Circuit Park",
      socialShareText = None,
      shortSocialShareText = None,
      metadata = Metadata.forHardcodedHostedArticlePage(id, campaign, pageName, title, standfirst, mainPicture)
    )
  }

  def fromPageName(pageName: String): Option[HostedPage] = {
    pageName match {
      case `overviewPageName` => Some(overviewArticlePage)
      case `packagesPageName` => Some(packagesArticlePage)
      case `offtrackPageName` => Some(offtrackArticlePage)
      case _ => None
    }
  }
}
