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
  def emailText = emailSubjectText.getOrElse(title) + " - Advertiser Content hosted by the Guardian"

  final val toneId = "tone/hosted"
  final val toneName = "Hosted"

  val brandColourCssClass = s"hosted-tone--${campaign.cssClass} hosted-tone"
  val brandBackgroundCssClass = s"hosted-tone-bg--${campaign.cssClass} hosted-tone-bg"
  val brandBorderCssClass = s"hosted-tone-border--${campaign.cssClass} hosted-tone-border"
  val brandBtnCssClass = s"hosted-tone-btn--${campaign.cssClass} hosted-tone-btn"

}

case class HostedCampaign(
  id: String,
  name: String,
  owner: String,
  logo: HostedLogo,
  cssClass: String,
  brandColour: String,
  brightFont: Boolean,
  logoLink: Option[String] = None
)

case class HostedLogo(
  url: String
)
