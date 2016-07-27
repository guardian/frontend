package common.commercial.hosted

import model.StandalonePage

trait HostedPage extends StandalonePage {
  def campaign: HostedCampaign
  def pageUrl: String
  def pageName: String
  def title: String
  def imageUrl: String
  def pageTitle: String
  def standfirst: String

  def facebookShareText: Option[String]
  def twitterShareText: Option[String]
  def emailSubjectText: Option[String]

  def twitterText = twitterShareText.getOrElse(if(standfirst.length < 136) standfirst else title) + " #ad"
  def facebookText = facebookShareText.getOrElse(standfirst)
  def emailText = emailSubjectText.getOrElse(title)

  final val toneId = "tone/hosted"
  final val toneName = "Hosted"
}

case class HostedCampaign(
  id: String,
  name: String,
  owner: String,
  logo: HostedLogo,
  cssClass: String
)

case class HostedLogo(
  url: String
)
