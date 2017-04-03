package common.commercial

import com.gu.commercial.branding.Branding
import com.gu.contentapi.client.model.v1.{Content, Section, Tag}
import common.Edition
import common.Edition.defaultEdition
import play.api.libs.json.Json

case class CommercialProperties(
  editionBrandings: Seq[EditionBranding],
  editionAdTargetings: Seq[EditionAdTargeting]
) {
  val isPaidContent: Boolean = branding(defaultEdition).exists(_.isPaid)
  val isFoundationFunded: Boolean = branding(defaultEdition).exists(_.isFoundationFunded)
  def isSponsored(edition: Edition): Boolean = branding(edition).exists(_.isSponsored)

  // Todo: remove this helper method when server-side ad targeting implemented before 2017-04-30
  val surgeBuckets: String = adTargeting(defaultEdition).getOrElse("su", "")

  def branding(edition: Edition): Option[Branding] = for {
    editionBranding <- editionBrandings.find(_.edition == edition)
    branding <- editionBranding.branding
  } yield branding

  def adTargeting(edition: Edition): Map[String, String] = {
    val params = for {
      editionAdTargeting <- editionAdTargetings.find(_.edition == edition)
    } yield editionAdTargeting.params
    params getOrElse Map.empty
  }
}

object CommercialProperties {

  implicit val commercialPropertiesFormat = Json.format[CommercialProperties]

  def fromContent(item: Content): CommercialProperties = CommercialProperties(
    editionBrandings = EditionBranding.fromContent(item),
    editionAdTargetings = EditionAdTargeting.fromContent(item)
  )

  def fromSection(section: Section): CommercialProperties = CommercialProperties(
    editionBrandings = EditionBranding.fromSection(section),
    editionAdTargetings = EditionAdTargeting.fromSection(section)
  )

  def fromTag(tag: Tag): CommercialProperties = CommercialProperties(
    editionBrandings = EditionBranding.fromTag(tag),
    editionAdTargetings = EditionAdTargeting.fromTag(tag)
  )
}
