package common.commercial.hosted.hardcoded

import common.commercial.hosted.{HostedCallToAction, HostedCampaign, HostedPage}
import model.MetaData

/*
 * Support functions that can be removed when the rest of the hardcoded content goes.
 */
object Support {

  def makeshiftPage(nextPage: NextHostedPage, hostedCampaign: HostedCampaign): HostedPage = new HostedPage {
    override def id: String = nextPage.id

    override def campaign: HostedCampaign = hostedCampaign

    override def pageName: String = "unused"

    override def title: String = nextPage.title

    override def imageUrl: String = nextPage.imageUrl

    override def standfirst: String = "unused"

    override def socialShareText: Option[String] = None

    override def shortSocialShareText: Option[String] = None

    override def cta: HostedCallToAction = HostedCallToAction(
      url = "unused",
      image = None,
      label = None,
      trackingCode = None,
      btnText = None
    )

    override def metadata: MetaData = MetaData(
      id = "unused",
      url = "unused",
      webUrl = "unused",
      section = None,
      webTitle = "unused",
      adUnitSuffix = "unused"
    )
  }
}
