package common.commercial.hosted

import java.net.URLEncoder

import com.gu.contentapi.client.model.v1.ContentType.{Article, Gallery, Video}
import com.gu.contentapi.client.model.v1.{Content, SponsorshipLogoDimensions}
import common.Logging
import common.commercial.Dimensions
import conf.Configuration.site
import model.StandalonePage
import play.api.libs.json.Json

trait HostedPage extends StandalonePage {
  def id: String
  def url = s"/$id"
  def encodedUrl = URLEncoder.encode(s"${site.host}/$id", "utf-8")

  def campaign: HostedCampaign
  def title: String
  def imageUrl: String
  def standfirst: String

  def socialShareText: Option[String]
  def shortSocialShareText: Option[String]

  def twitterText = shortSocialShareText.getOrElse(if (standfirst.length < 136) standfirst else title) + " #ad"
  def facebookText = socialShareText.getOrElse(standfirst)
  def emailSubjectText = title + " - Advertiser Content hosted by the Guardian"
  def emailBodyText = s"${socialShareText.getOrElse(standfirst)} $encodedUrl"

  def cta: HostedCallToAction

  // Todo: remove when hardcoded go
  def pageName: String
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

case class HostedCampaign(
  id: String,
  name: String,
  owner: String,
  logo: HostedLogo,
  fontColour: Colour
)

object HostedCampaign {

  def fromContent(item: Content): Option[HostedCampaign] = {
    for {
      section <- item.section
      hostedTag <- item.tags find (_.paidContentType.contains("HostedContent"))
      sponsorships <- hostedTag.activeSponsorships
      sponsorship <- sponsorships.headOption
    } yield {
      val id = section.id.stripPrefix("advertiser-content/")
      HostedCampaign(
        id,
        name = section.webTitle,
        owner = sponsorship.sponsorName,
        logo = HostedLogo.make(sponsorship.sponsorLogo, sponsorship.sponsorLogoDimensions, id),
        fontColour = Colour(hostedTag.paidContentCampaignColour getOrElse "")
      )
    }
  }
}

case class HostedLogo(url: String, dimensions: Option[Dimensions], trackingCode: String)

object HostedLogo {

  implicit val jsonFormat = Json.format[HostedLogo]

  def make(url: String, dimensions: Option[SponsorshipLogoDimensions], campaignId: String) = HostedLogo(
    url,
    dimensions map (d => Dimensions(d.width, d.height)),
    trackingCode = s"$campaignId logo"
  )
}
