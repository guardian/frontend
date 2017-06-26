package common.commercial

import com.gu.commercial.branding.Branding
import com.gu.commercial.display._
import com.gu.contentapi.client.model.v1.{Content, Section, Tag}
import common.Edition
import common.Edition.defaultEdition
import play.api.libs.json.Json

case class CommercialProperties(
  editionBrandings: Set[EditionBranding],
  editionAdTargetings: Set[EditionAdTargeting]
) {
  val isPaidContent: Boolean = branding(defaultEdition).exists(_.isPaid)
  val isFoundationFunded: Boolean = branding(defaultEdition).exists(_.isFoundationFunded)
  def isSponsored(edition: Edition): Boolean = branding(edition).exists(_.isSponsored)

  def branding(edition: Edition): Option[Branding] = for {
    editionBranding <- editionBrandings.find(_.edition == edition)
    branding <- editionBranding.branding
  } yield branding

  def adTargeting(edition: Edition): Set[AdTargetParam] =
    editionAdTargetings
      .find(_.edition == edition)
      .flatMap(_.paramSet)
      .getOrElse(Set.empty)
}

object CommercialProperties {

  implicit val commercialPropertiesFormat = Json.format[CommercialProperties]

  val empty = CommercialProperties(editionBrandings = Set.empty, editionAdTargetings = Set.empty)

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

  private def isNetworkFront(frontId: String): Boolean = Edition.all.map(_.networkFrontId).contains(frontId)

  def forNetworkFront(frontId: String): Option[CommercialProperties] = {
    if (isNetworkFront(frontId)) {
      Some(
        CommercialProperties(
          editionBrandings = Set.empty,
          editionAdTargetings = EditionAdTargeting.forNetworkFront(frontId)
        )
      )
    } else None
  }

  def forFrontUnknownToCapi(frontId: String): CommercialProperties = CommercialProperties(
    editionBrandings = Set.empty,
    editionAdTargetings = EditionAdTargeting.forFrontUnknownToCapi(frontId)
  )
}
