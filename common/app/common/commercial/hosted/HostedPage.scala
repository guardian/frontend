package common.commercial.hosted

import model.StandalonePage

trait HostedPage extends StandalonePage {
  def campaign: HostedCampaign
  def pageUrl: String
  def pageName: String
  def pageTitle: String
  def standfirst: String
}

case class HostedCampaign(
  id: String,
  name: String,
  owner: String,
  logo: HostedLogo
)

case class HostedLogo(
  url: String
)

case class HostedCallToAction(
  url: String,
  label: String,
  trackingCode: String
)
