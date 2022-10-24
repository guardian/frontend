package common.commercial

import com.gu.commercial.branding.Branding
import com.gu.commercial.display._
import com.gu.contentapi.client.model.v1.{Content, Section, Tag}
import common.Edition
import common.Edition.defaultEdition
import common.dfp.DfpAgent
import play.api.libs.json.Json

case class EditionCommercialProperties(branding: Option[Branding], adTargeting: Set[AdTargetParam])

object EditionCommercialProperties {
  implicit val thirdNeedlessFormatter = EditionAdTargeting.adTargetParamFormat
  implicit val secondNeedlessFormatter = EditionBranding.brandingFormat
  implicit val firstNeedlessFormatter = Json.format[EditionCommercialProperties]

}
case class CommercialProperties(
    editionBrandings: Set[EditionBranding],
    editionAdTargetings: Set[EditionAdTargeting],
    prebidIndexSites: Option[Set[PrebidIndexSite]],
) {

  val isPaidContent: Boolean = branding(defaultEdition).exists(_.isPaid)
  val isFoundationFunded: Boolean = branding(defaultEdition).exists(_.isFoundationFunded)
  def isSponsored(edition: Edition): Boolean = branding(edition).exists(_.isSponsored)
  val nonRefreshableLineItemIds: Seq[Long] = DfpAgent.nonRefreshableLineItemIds()

  def branding(edition: Edition): Option[Branding] =
    for {
      editionBranding <- editionBrandings.find(_.edition == edition)
      branding <- editionBranding.branding
    } yield branding

  def adTargeting(edition: Edition): Set[AdTargetParam] =
    editionAdTargetings
      .find(_.edition == edition)
      .flatMap(_.paramSet)
      .getOrElse(Set.empty)

  def perEdition: Map[Edition, EditionCommercialProperties] = {
    Edition.allWithBetaEditions.map { edition =>
      (
        edition,
        EditionCommercialProperties(
          branding(edition),
          adTargeting(edition),
        ),
      )
    }.toMap
  }
}

object CommercialProperties {

  implicit val commercialPropertiesFormat = Json.format[CommercialProperties]

  val empty = CommercialProperties(
    editionBrandings = Set.empty,
    editionAdTargetings = Set.empty,
    prebidIndexSites = None,
  )

  def fromContent(item: Content): CommercialProperties =
    CommercialProperties(
      editionBrandings = EditionBranding.fromContent(item),
      editionAdTargetings = EditionAdTargeting.fromContent(item),
      prebidIndexSites = PrebidIndexSite.fromContent(item),
    )

  def fromSection(section: Section): CommercialProperties =
    CommercialProperties(
      editionBrandings = EditionBranding.fromSection(section),
      editionAdTargetings = EditionAdTargeting.fromSection(section),
      prebidIndexSites = PrebidIndexSite.fromSection(section),
    )

  def fromTag(tag: Tag): CommercialProperties =
    CommercialProperties(
      editionBrandings = EditionBranding.fromTag(tag),
      editionAdTargetings = EditionAdTargeting.fromTag(tag),
      prebidIndexSites = PrebidIndexSite.fromTag(tag),
    )

  private def isNetworkFront(frontId: String): Boolean = Edition.byNetworkFrontId(frontId).isDefined

  def forNetworkFront(frontId: String): Option[CommercialProperties] = {
    if (isNetworkFront(frontId)) {
      Some(
        CommercialProperties(
          editionBrandings = Set.empty,
          editionAdTargetings = EditionAdTargeting.forNetworkFront(frontId),
          prebidIndexSites = PrebidIndexSite.forNetworkFront(frontId),
        ),
      )
    } else None
  }

  def forFrontUnknownToCapi(frontId: String): CommercialProperties =
    CommercialProperties(
      editionBrandings = Set.empty,
      editionAdTargetings = EditionAdTargeting.forFrontUnknownToCapi(frontId),
      prebidIndexSites = PrebidIndexSite.forFrontUnknownToCapi(frontId),
    )
}
