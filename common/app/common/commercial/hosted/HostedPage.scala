package common.commercial.hosted

import java.net.URLEncoder

import com.gu.commercial.branding.Dimensions
import com.gu.contentapi.client.model.v1.ContentType.{Article, Gallery, Video}
import com.gu.contentapi.client.model.v1.{Content, SponsorshipLogoDimensions}
import common.GuLogging
import common.commercial.hosted.HostedVideoPage.log
import common.commercial.hosted.LoggingUtils.getAndLog
import conf.Configuration.site
import model.StandalonePage

trait HostedPage extends StandalonePage {
  def id: String
  def url: String = s"/$id"
  def encodedUrl: String = URLEncoder.encode(s"${site.host}/$id", "utf-8")

  def campaign: Option[HostedCampaign]
  def title: String
  def mainImageUrl: String
  def thumbnailUrl: String
  def standfirst: String

  def socialShareText: Option[String]
  def shortSocialShareText: Option[String]

  def twitterText: String = shortSocialShareText.getOrElse(if (standfirst.length < 136) standfirst else title) + " #ad"
  def facebookText: String = socialShareText.getOrElse(standfirst)
  def emailSubjectText: String = title + " - Advertiser Content hosted by the Guardian"
  def emailBodyText: String = s"${socialShareText.getOrElse(standfirst)} $encodedUrl"

  def cta: HostedCallToAction

  def name: String = campaign.map(_.name).getOrElse("*** Not live yet: Campaign name will go here ***")
  def owner: String = campaign.map(_.owner).getOrElse("*** Not live yet: Campaign owner will go here ***")
  def logo: HostedLogo = campaign.map(_.logo).getOrElse(HostedLogo.placeholder)
  def fontColour: Colour = campaign.map(_.fontColour).getOrElse(Colour.black)
}

object HostedPage extends GuLogging {

  def fromContent(item: Content): Option[HostedPage] = {
    if (item.isHosted) {
      item.`type` match {
        case Video   => HostedVideoPage.fromContent(item)
        case Article => HostedArticlePage.fromContent(item)
        case Gallery => HostedGalleryPage.fromContent(item)
        case _       =>
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
    fontColour: Colour,
)

object HostedCampaign {

  def fromContent(item: Content): Option[HostedCampaign] = {
    log.info(s"Building hosted campaign for ${item.id} ...")
    val campaign = for {
      section <- getAndLog(item, item.section, "has no section")
      hostedTag <- getAndLog(item, item.tags find (_.paidContentType.contains("HostedContent")), "has no hosted tag")
      sponsorships <- getAndLog(item, hostedTag.activeSponsorships, "has no sponsorships")
      sponsorship <- getAndLog(item, sponsorships.headOption, "has no sponsorship")
    } yield {
      val id = section.id.stripPrefix("advertiser-content/")
      HostedCampaign(
        id,
        name = section.webTitle,
        owner = sponsorship.sponsorName,
        logo = HostedLogo.make(
          src = sponsorship.sponsorLogo,
          dimensions = sponsorship.sponsorLogoDimensions,
          link = sponsorship.sponsorLink,
        ),
        fontColour = Colour(hostedTag.paidContentCampaignColour getOrElse ""),
      )
    }
    if (campaign.isEmpty) log.error(s"Failed to build HostedCampaign from $item")
    campaign
  }
}

case class HostedLogo(src: String, dimensions: Option[Dimensions], link: String)

object HostedLogo {

  val placeholder = HostedLogo(
    src = "",
    dimensions = None,
    link = "",
  )

  def make(
      src: String,
      dimensions: Option[SponsorshipLogoDimensions],
      link: String,
  ): HostedLogo =
    HostedLogo(
      src,
      dimensions map (d => Dimensions(d.width, d.height)),
      link,
    )
}
