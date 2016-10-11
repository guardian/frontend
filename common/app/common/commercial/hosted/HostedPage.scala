package common.commercial.hosted

import java.awt.Color
import java.net.URLEncoder

import com.gu.contentapi.client.model.v1.Content
import com.gu.contentapi.client.model.v1.ContentType.{Article, Gallery, Video}
import common.Logging
import conf.Configuration.site
import model.StandalonePage

// todo remove
object HostedContentType extends Enumeration {
  val Video, Article, Gallery = Value
}

trait HostedPage extends StandalonePage {
  def id: String
  def url = s"/$id"
  def encodedUrl = URLEncoder.encode(s"${site.host}/$id", "utf-8")

  def campaign: HostedCampaign
  def title: String
  // todo where is this set?
  def imageUrl: String
  // todo remove and replace with title
  def pageTitle: String
  def standfirst: String

  def socialShareText: Option[String]
  def shortSocialShareText: Option[String]

  def twitterText = shortSocialShareText.getOrElse(if (standfirst.length < 136) standfirst else title) + " #ad"
  def facebookText = socialShareText.getOrElse(standfirst)
  def emailSubjectText = title + " - Advertiser Content hosted by the Guardian"
  def emailBodyText = s"${socialShareText.getOrElse(standfirst)} $encodedUrl"

  def cta: HostedCallToAction

  // todo remove
  def contentType = {
    this match {
      case page: HostedVideoPage => HostedContentType.Video
      case page: HostedArticlePage => HostedContentType.Article
      case page: HostedGalleryPage => HostedContentType.Gallery
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
        case Gallery => HostedGalleryPage.fromContent(item)
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

// todo move to hardcoded
case class NextHostedPage(
  id: String,
  title: String,
  contentType: HostedContentType.Value,
  imageUrl: String
) {

  val url = s"/$id"
}

case class HostedCampaign(
  id: String,
  name: String,
  owner: String,
  logoUrl: String,
  fontColour: FontColour
)

object HostedCampaign {

  def fromContent(item: Content): Option[HostedCampaign] = {
    for {
      section <- item.section
      hostedTag <- item.tags find (_.paidContentType.contains("HostedContent"))
      sponsorships <- hostedTag.activeSponsorships
      sponsorship <- sponsorships.headOption
    } yield {
      HostedCampaign(
        id = section.id.stripPrefix("advertiser-content/"),
        name = section.webTitle,
        owner = sponsorship.sponsorName,
        logoUrl = sponsorship.sponsorLogo,
        fontColour = FontColour(hostedTag.paidContentCampaignColour getOrElse "")
      )
    }
  }
}

case class FontColour(brandColour: String) {

  lazy val shouldHaveBrightFont = !isBrandColourBright

  private val isBrandColourBright = {
    val hexColour = brandColour.stripPrefix("#")
    val rgb = Integer.parseInt(hexColour, 16)
    val c = new Color(rgb)
    // the conversion in java.awt.Color uses HSB colour space, whereas we want HSL here
    // see http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
    val min = Math.min(Math.min(c.getRed, c.getGreen), c.getBlue)
    val max = Math.max(Math.max(c.getRed, c.getGreen), c.getBlue)
    val lightness = (min + max).toDouble / 510
    lightness > 0.5
  }
}
