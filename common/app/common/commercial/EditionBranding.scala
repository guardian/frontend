package common.commercial

import com.gu.commercial.branding._
import com.gu.contentapi.client.model.v1.{Content, Section, Tag}
import common.Edition
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
        case Foundation.name => Foundation
        case _ => Sponsored
      }
    }

    Json.format[Branding]
  }

  implicit val editionBrandingFormat = Json.format[EditionBranding]

  def fromItem(item: Content): Seq[EditionBranding] = Edition.all.map { edition =>
    EditionBranding(edition, BrandingFinder.findBranding(item, edition.id))
  }

  def fromSection(section: Section): Seq[EditionBranding] = Edition.all.map { edition =>
    EditionBranding(edition, BrandingFinder.findBranding(section, edition.id))
  }

  def fromTag(tag: Tag): Seq[EditionBranding] = Edition.all.map { edition =>
    EditionBranding(edition, BrandingFinder.findBranding(tag, edition.id))
  }

  def branding(editionBrandings: Option[Seq[EditionBranding]], edition: Edition): Option[Branding] = for {
    brandings <- editionBrandings
    editionBranding <- brandings.find(_.edition == edition)
    branding <- editionBranding.branding
  } yield branding
}
