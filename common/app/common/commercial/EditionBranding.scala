package common.commercial

import com.gu.commercial.branding._
import com.gu.contentapi.client.model.v1.{Content, Section, Tag}
import common.Edition
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json._

case class EditionBranding(edition: Edition, branding: Option[Branding])

object EditionBranding {

  implicit val brandingFormat = {

    implicit val dimensionsFormat = Json.format[Dimensions]

    implicit val logoFormat = Json.format[Logo]

    implicit val brandingTypeWrites: Writes[BrandingType] = new Writes[BrandingType] {
      def writes(brandingType: BrandingType): JsValue = Json.obj("name" -> brandingType.name)
    }

    implicit val brandingTypeReads: Reads[BrandingType] = {
      (__ \ "name").read[String] map {
        case PaidContent.name => PaidContent
        case Foundation.name  => Foundation
        case _                => Sponsored
      }
    }

    val brandingReads: Reads[Branding] = (
      (JsPath \ "brandingType").read[BrandingType] and
        (JsPath \ "sponsorName").read[String] and
        (JsPath \ "logo").read[Logo] and
        (JsPath \ "logoForDarkBackground").readNullable[Logo] and
        // the 'about this' link has become required so this is to avoid breaking a lot of pressed fronts
        (JsPath \ "aboutThisLink").readNullable[String].map(_.getOrElse("")) and
        (JsPath \ "hostedCampaignColour").readNullable[String]
    )(Branding.apply _)

    Format(brandingReads, Json.writes[Branding])
  }

  implicit val editionBrandingFormat = Json.format[EditionBranding]

  val editions = Edition.allWithBetaEditions.toSet

  def fromContent(item: Content): Set[EditionBranding] =
    editions map { edition =>
      EditionBranding(edition, BrandingFinder.findBranding(edition.id)(item))
    }

  def fromSection(section: Section): Set[EditionBranding] =
    editions map { edition =>
      EditionBranding(edition, BrandingFinder.findBranding(edition.id)(section))
    }

  def fromTag(tag: Tag): Set[EditionBranding] =
    editions map { edition =>
      EditionBranding(edition, BrandingFinder.findBranding(edition.id)(tag))
    }
}
