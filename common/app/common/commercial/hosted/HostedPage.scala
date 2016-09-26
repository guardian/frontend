package common.commercial.hosted

import java.awt.Color
import java.net.URLEncoder

import com.gu.contentapi.client.model.v1.Content
import com.gu.contentapi.client.model.v1.ContentType.{Article, Video}
import common.Logging
import model.StandalonePage

object HostedContentType extends Enumeration {
  val Video, Article, Gallery = Value
}

trait HostedPage extends StandalonePage {
  def campaign: HostedCampaign
  def pageUrl: String
  def pageName: String
  def title: String
  def imageUrl: String
  def pageTitle: String
  def standfirst: String

  def socialShareText: Option[String]
  def shortSocialShareText: Option[String]

  def twitterText = shortSocialShareText.getOrElse(if(standfirst.length < 136) standfirst else title) + " #ad"
  def facebookText = socialShareText.getOrElse(standfirst)
  def emailSubjectText = title + " - Advertiser Content hosted by the Guardian"
  def emailBodyText = s"${socialShareText.getOrElse(standfirst)} ${URLEncoder.encode(pageUrl, "utf-8")}"

  final val toneId = "tone/hosted"
  final val toneName = "Hosted"

  def cta: HostedCallToAction

  def contentType = {
    this match {
      case page: HostedVideoPage => HostedContentType.Video
      case page: HostedArticlePage => HostedContentType.Article
      case _ => HostedContentType.Gallery
    }
  }
}

object HostedPage extends Logging {

  def fromContent(item: Content): Option[HostedPage] = {
    if (item.isHosted) {
      item.`type` match {
        case Video => HostedVideoPage.fromContent(item)
        case Article => HostedArticlePage.fromContent(item)
        case _ =>
          log.error(s"Failed to make unsupported hosted type: ${item.`type`}: ${item.id}")
          None
      }
    } else {
      log.error(s"Failed to make non-hosted content: ${item.id}")
      None
    }
  }
}

case class NextHostedPage(
  pageUrl: String,
  title: String,
  contentType: HostedContentType.Value,
  imageUrl: String
)

case class HostedCampaign(
  id: String,
  name: String,
  owner: String,
  logo: HostedLogo,
  fontColour: FontColour,
  logoLink: Option[String] = None
)

case class FontColour(brandColour: String) {

  lazy val shouldHaveBrightFont = !isBrandColourBright

  private val isBrandColourBright = {
    val hexColour = brandColour.stripPrefix("#")
    val rgb = Integer.parseInt(hexColour, 16)
    val c = new Color(rgb)
    // the conversion in java.awt.Color uses HSB colour space, whereas we want HSL here
    // see http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
    val min: Float = Math.min(Math.min(c.getRed, c.getGreen), c.getBlue)
    val max: Float = Math.max(Math.max(c.getRed, c.getGreen), c.getBlue)
    val lightness = (min + max) / 510
    lightness > 0.5
  }
}

case class HostedLogo(
  url: String
)
