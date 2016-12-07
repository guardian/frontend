package common.commercial

import com.gu.contentapi.client.model.v1.{SponsorshipLogoDimensions, Sponsorship => ApiSponsorship,
SponsorshipTargeting => ApiSponsorshipTargeting, SponsorshipType => ApiSponsorshipType}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichCapiDateTime
import common.Edition
import org.joda.time.DateTime
import play.api.libs.functional.syntax._
import play.api.libs.json.{Json, _}

sealed trait SponsorshipType {
  def name: String
}

object SponsorshipType {

  implicit val sponsorshipTypeFormat: Format[SponsorshipType] = {
    def readFromJson(name: String): SponsorshipType = make(name)
    def writeToJson(sponsorshipType: SponsorshipType): String = sponsorshipType.name

    // this is to format a single-value json element
    // see http://stackoverflow.com/a/24436130
    (__ \ "name").format[String].inmap(readFromJson, writeToJson)
  }

  def make(name: String): SponsorshipType = name match {
    case PaidContent.name => PaidContent
    case Foundation.name => Foundation
    case _ => Sponsored
  }
}

case object Sponsored extends SponsorshipType {
  override val name: String = "sponsored"
}

case object Foundation extends SponsorshipType {
  override val name: String = "foundation"
}

case object PaidContent extends SponsorshipType {
  override val name: String = "paid-content"
}


case class SponsorshipTargeting(
  validEditions: Seq[Edition],
  publishedSince: Option[DateTime]
)

object SponsorshipTargeting {

  implicit val sponsorshipTargetingFormat = Json.format[SponsorshipTargeting]

  def make(targeting: ApiSponsorshipTargeting): SponsorshipTargeting = {
    SponsorshipTargeting(
      targeting.validEditions.map(_.flatMap(Edition.byId)).getOrElse(Nil),
      targeting.publishedSince.map(_.toJodaDateTime)
    )
  }
}

case class Dimensions(width: Int, height: Int)

object Dimensions {

  implicit val dimensionsFormat = Json.format[Dimensions]
}

case class Logo(url: String, dimensions: Option[Dimensions])

object Logo {

  implicit val logoFormat = Json.format[Logo]

  def make(url: String, dimensions: Option[SponsorshipLogoDimensions]) = Logo(
    url,
    dimensions map (d => Dimensions(d.width, d.height))
  )
}

case class Branding(
  sponsorshipType: SponsorshipType,
  sponsorName: String,
  sponsorLogo: Logo,
  highContrastSponsorLogo: Option[Logo],
  sponsorLink: String,
  aboutThisLink: String,
  targeting: Option[SponsorshipTargeting],
  foundationFundedContext: Option[String]
) {

  val label = (sponsorshipType, foundationFundedContext) match {
    case (PaidContent, _) => "Paid for by"
    case (Foundation, Some(context)) => s"$context is supported by"
    case _ => "Supported by"
  }

  def isTargeting(optPublicationDate: Option[DateTime], edition: Edition): Boolean = {

    def isTargetingEdition(validEditions: Seq[Edition]): Boolean = {
      validEditions.isEmpty || validEditions.contains(edition)
    }

    def isPublishedSince(optThreshold: Option[DateTime]): Boolean = {
      val comparison = for {
        publicationDate <- optPublicationDate
        threshold <- optThreshold
      } yield {
        publicationDate isAfter threshold
      }
      comparison getOrElse true
    }

    targeting.isEmpty || targeting.exists { t =>
      isTargetingEdition(t.validEditions) && isPublishedSince(t.publishedSince)
    }
  }
}

object Branding {

  implicit val brandingFormat = Json.format[Branding]

  def make(sectionOrTagName: String)(sponsorship: ApiSponsorship): Branding = {

    Branding(
      sponsorshipType = sponsorship.sponsorshipType match {
        case ApiSponsorshipType.PaidContent => PaidContent
        case ApiSponsorshipType.Foundation => Foundation
        case _ => Sponsored
      },
      sponsorName = sponsorship.sponsorName,
      sponsorLogo = Logo.make(sponsorship.sponsorLogo, sponsorship.sponsorLogoDimensions),
      highContrastSponsorLogo = sponsorship.highContrastSponsorLogo map { url =>
        Logo.make(url, sponsorship.highContrastSponsorLogoDimensions)
      },
      sponsorLink = sponsorship.sponsorLink,
      aboutThisLink = sponsorship.aboutLink getOrElse "/sponsored-content",
      targeting = sponsorship.targeting map SponsorshipTargeting.make,
      foundationFundedContext = sponsorship.sponsorshipType match {
        case ApiSponsorshipType.Foundation => Some(sectionOrTagName)
        case _ => None
      }
    )
  }
}
