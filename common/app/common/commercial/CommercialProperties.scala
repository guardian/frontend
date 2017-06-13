package common.commercial

import com.gu.commercial.branding.Branding
import com.gu.commercial.display._
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

  def branding(edition: Edition): Option[Branding] = for {
    editionBranding <- editionBrandings.find(_.edition == edition)
    branding <- editionBranding.branding
  } yield branding

  def combineTheMaps(
      leftMap: Map[AdCallParamKey, AdCallParamValue],
      rightMap: Map[AdCallParamKey, AdCallParamValue]): Map[AdCallParamKey, AdCallParamValue] = {
    leftMap.map{
      case (leftKey, leftSingleValue@SingleValue(leftValue)) =>
        val newSingleValue: SingleValue = rightMap.get(leftKey).collect {
          case SingleValue(rightValue) if leftValue != rightValue => SingleValue(s"$leftValue$rightValue")
        }.getOrElse(leftSingleValue)

        (leftKey, newSingleValue)

      case (leftKey, leftMultipleValues@MultipleValues(leftValues)) =>
        val newMultipleValues: MultipleValues = rightMap.get(leftKey).collect {
            case MultipleValues(rightValues) =>
              MultipleValues(leftValues ++ rightValues)}
          .getOrElse(leftMultipleValues)

        (leftKey, newMultipleValues)
    }
  }

  def adTargeting(edition: Edition): Map[AdCallParamKey, AdCallParamValue] =
    editionAdTargetings.
      filter(_.edition == edition)
      .map(_.params)
      .reduce{ (m1, m2) => combineTheMaps(m1, m2) }

}

object CommercialProperties {

  implicit val commercialPropertiesFormat = Json.format[CommercialProperties]

  val empty = CommercialProperties(editionBrandings = Nil, editionAdTargetings = Nil)

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
      Some(CommercialProperties(
        editionBrandings = Nil,
        editionAdTargetings = EditionAdTargeting.forNetworkFront(frontId)
      ))
    } else None
  }

  def forFrontUnknownToCapi(frontId: String): CommercialProperties = CommercialProperties(
    editionBrandings = Nil,
    editionAdTargetings = EditionAdTargeting.forFrontUnknownToCapi(frontId)
  )
}
