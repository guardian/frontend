package common.dfp

import common.Edition
import common.dfp.AdSize.{leaderboardSize, responsiveSize}
import org.joda.time.DateTime
import org.joda.time.DateTime.now
import org.joda.time.format.ISODateTimeFormat
import play.api.libs.functional.syntax._
import play.api.libs.json._
import play.api.libs.json.JodaReads._

import scala.language.postfixOps

sealed trait GuLineItemType {
  val asString: String
}

case object Sponsorship extends GuLineItemType {
  val asString: String = "sponsorship"
}
case class Other(get: String) extends GuLineItemType {
  val asString: String = get
}

object GuLineItemType {

  def fromDFPLineItemType(dfpLineItemType: String): GuLineItemType =
    dfpLineItemType.toLowerCase match {
      case Sponsorship.asString => Sponsorship
      case otherLineItemType    => Other(otherLineItemType)
    }

  implicit val guLineItemWrites = new Writes[GuLineItemType] {
    def writes(lineItemType: GuLineItemType): JsValue = {
      lineItemType match {
        case Sponsorship                 => JsString("sponsorship")
        case Other(lineItemTypeAsString) => JsString(lineItemTypeAsString)
      }
    }
  }

  implicit val guLineItemTypeReads: Reads[GuLineItemType] =
    JsPath.read[String].map {
      case "sponsorship" => Sponsorship
      case otherType     => Other(otherType)
    }
}

case class GuCustomTargeting(
    keyId: Long,
    name: String,
    displayName: String,
    values: Seq[GuCustomTargetingValue],
) {
  val readableValues: Seq[GuCustomTargetingValue] = values.filter(_.displayName.nonEmpty)
}

case class GuCustomTargetingValue(
    id: Long,
    name: String,
    displayName: String,
)

object GuCustomTargetingValue {
  implicit val format = Json.format[GuCustomTargetingValue]
}

object GuCustomTargeting {
  implicit val format = Json.format[GuCustomTargeting]
}

case class CustomTarget(name: String, op: String, values: Seq[String]) {

  def isPositive(targetName: String): Boolean = name == targetName && op == "IS"
  def isNegative(targetName: String): Boolean = name == targetName && op == "IS_NOT"

  def isSlot(value: String): Boolean = isPositive("slot") && values.contains(value)

  def isPlatform(value: String): Boolean = isPositive("p") && values.contains(value)
  def isNotPlatform(value: String): Boolean = isNegative("p") && values.contains(value)

  val isInlineMerchandisingSlot = isSlot("im")

  val isHighMerchandisingSlot = isSlot("merchandising-high")

  val isAdTest = isPositive("at")

  val isKeywordTag = isPositive("k")
  val isSeriesTag = isPositive("se")
  val isContributorTag = isPositive("co")
  val isEditionTag = isPositive("edition")
  val isSectionTag = isPositive("s")
}

object CustomTarget {

  implicit val customTargetFormats: Format[CustomTarget] = Json.format[CustomTarget]

}

case class CustomTargetSet(op: String, targets: Seq[CustomTarget]) {

  def filterTags(tagCriteria: CustomTarget => Boolean)(bySlotType: CustomTarget => Boolean): Seq[String] = {
    if (targets exists bySlotType) {
      targets.filter(tagCriteria).flatMap(_.values).distinct
    } else Nil
  }

  val inlineMerchandisingTargetedKeywords = filterTags(tag => tag.isKeywordTag)(_.isInlineMerchandisingSlot)
  val inlineMerchandisingTargetedSeries = filterTags(tag => tag.isSeriesTag)(_.isInlineMerchandisingSlot)
  val inlineMerchandisingTargetedContributors = filterTags(tag => tag.isContributorTag)(_.isInlineMerchandisingSlot)
  val inlineMerchandisingTargetedSections = filterTags(tag => tag.isSectionTag)(_.isInlineMerchandisingSlot)

  val highMerchandisingTargets =
    filterTags(tag => tag.isKeywordTag || tag.isSeriesTag || tag.isContributorTag)(_.isHighMerchandisingSlot)
}

object CustomTargetSet {

  implicit val customTargetSetFormats: Format[CustomTargetSet] = Json.format[CustomTargetSet]

}

case class GeoTarget(id: Long, parentId: Option[Int], locationType: String, name: String) {

  private def targetsCountry(name: String) = locationType == "COUNTRY" && name == name

  lazy val targetsUk = targetsCountry("United Kingdom")

  lazy val targetsUs = targetsCountry("United States")

  lazy val targetsAustralia = targetsCountry("Australia")
}

object GeoTarget {

  implicit val geoTargetFormats: Format[GeoTarget] = Json.format[GeoTarget]

}

case class GuCustomField(
    id: Long,
    name: String,
    description: String,
    isActive: Boolean,
    entityType: String,
    dataType: String,
    visibility: String,
    options: List[GuCustomFieldOption],
)

case class GuCustomFieldOption(id: Long, name: String)

object GuCustomField {

  implicit val customFieldOptionFormats: Format[GuCustomFieldOption] = Json.format[GuCustomFieldOption]
  implicit val customFieldFormats: Format[GuCustomField] = Json.format[GuCustomField]

}

case class GuAdUnit(id: String, path: Seq[String], status: String) {
  val fullPath = path.mkString("/")

  val isActive = status == "ACTIVE"
  val isInactive = status == "INACTIVE"
  val isArchived = status == "ARCHIVED"

  val isRunOfNetwork = path.isEmpty
}

object GuAdUnit {

  implicit val adUnitFormats = Json.format[GuAdUnit]

  val ACTIVE = "ACTIVE"
  val INACTIVE = "INACTIVE"
  val ARCHIVED = "ARCHIVED"
}

case class GuTargeting(
    adUnitsIncluded: Seq[GuAdUnit],
    adUnitsExcluded: Seq[GuAdUnit],
    geoTargetsIncluded: Seq[GeoTarget],
    geoTargetsExcluded: Seq[GeoTarget],
    customTargetSets: Seq[CustomTargetSet],
) {

  private val tagValues = (
      (
          customTargetSets: Seq[CustomTargetSet],
          tagFilter: CustomTarget => Boolean,
      ) => customTargetSets.flatMap(_.targets).filter(tagFilter).flatMap(_.values),
  )

  val serieValues: Seq[String] = tagValues(customTargetSets, _.isSeriesTag)
  val keywordValues: Seq[String] = tagValues(customTargetSets, _.isKeywordTag)

  val adTestValue: Option[String] = {
    val testValues = for {
      targetSet <- customTargetSets
      target <- targetSet.targets
      if target.isAdTest
      targetValue <- target.values
    } yield targetValue

    testValues.headOption
  }

  val editions: Seq[Edition] = {
    val targets = customTargetSets flatMap (_.targets filter (_.isEditionTag))
    targets flatMap (_.values) flatMap Edition.byId
  }

  val hasAdTestTargetting: Boolean = adTestValue.isDefined

  def targetsSectionFrontDirectly(sectionId: String): Boolean = {
    adUnitsIncluded.exists { adUnit =>
      val path = adUnit.path
      path.length == 3 &&
      path(1) == sectionId &&
      path(2) == "front"
    }
  }
}

object GuTargeting {
  implicit val guTargetingFormats: Format[GuTargeting] = Json.format[GuTargeting]
}

case class GuLineItem(
    id: Long,
    orderId: Long,
    name: String,
    lineItemType: GuLineItemType,
    startTime: DateTime,
    endTime: Option[DateTime],
    isPageSkin: Boolean,
    sponsor: Option[String],
    status: String,
    costType: String,
    creativePlaceholders: Seq[GuCreativePlaceholder],
    targeting: GuTargeting,
    lastModified: DateTime,
) {

  val isCurrent = startTime.isBeforeNow && (endTime.isEmpty || endTime.exists(_.isAfterNow))
  val isExpired = endTime.exists(_.isBeforeNow)
  val isExpiredRecently = isExpired && endTime.exists(_.isAfter(now.minusWeeks(1)))
  val isExpiringSoon = !isExpired && endTime.exists(_.isBefore(now.plusMonths(1)))

  val inlineMerchandisingTargetedKeywords: Seq[String] =
    targeting.customTargetSets.flatMap(_.inlineMerchandisingTargetedKeywords).distinct
  val inlineMerchandisingTargetedSeries: Seq[String] =
    targeting.customTargetSets.flatMap(_.inlineMerchandisingTargetedSeries).distinct
  val inlineMerchandisingTargetedContributors: Seq[String] =
    targeting.customTargetSets.flatMap(_.inlineMerchandisingTargetedContributors).distinct
  val inlineMerchandisingTargetedSections: Seq[String] =
    targeting.customTargetSets.flatMap(_.inlineMerchandisingTargetedSections).distinct

  val highMerchandisingTargets: Seq[String] = targeting.customTargetSets.flatMap(_.highMerchandisingTargets).distinct

  val targetsHighMerchandising: Boolean = {
    val targetSlotIsHighMerch = for {
      targetSet <- targeting.customTargetSets
      target <- targetSet.targets
      if target.name == "slot" && target.values.contains("merchandising-high")
    } yield target
    targetSlotIsHighMerch.nonEmpty
  }

  lazy val targetsNetworkOrSectionFrontDirectly: Boolean = {
    targeting.adUnitsIncluded.exists { adUnit =>
      val path = adUnit.path
      (path.length == 3 || path.length == 4) && path(2) == "front"
    }
  }

  lazy val isSuitableForTopAboveNavSlot: Boolean = {

    val placeholder = creativePlaceholders find { placeholder =>
      placeholder.size == leaderboardSize || placeholder.size == responsiveSize
    }

    costType == "CPD" &&
    placeholder.nonEmpty && (
      targeting.targetsSectionFrontDirectly("business") ||
      placeholder.exists(_.targetsSectionFrontDirectly("business"))
    ) &&
    targeting.geoTargetsIncluded.exists { geoTarget =>
      geoTarget.targetsUk || geoTarget.targetsUs || geoTarget.targetsAustralia
    } &&
    startTime.isBefore(now.plusDays(1)) &&
    (endTime.isEmpty || endTime.exists(_.isAfterNow))
  }

  lazy val creativeSizes = creativePlaceholders map (_.size)
}

object GuLineItem {

  private val timeFormatter = ISODateTimeFormat.dateTime().withZoneUTC()

  implicit val lineItemWrites = new Writes[GuLineItem] {
    def writes(lineItem: GuLineItem): JsValue = {
      Json.obj(
        "id" -> lineItem.id,
        "orderId" -> lineItem.orderId,
        "name" -> lineItem.name,
        "lineItemType" -> lineItem.lineItemType,
        "startTime" -> timeFormatter.print(lineItem.startTime),
        "endTime" -> lineItem.endTime.map(timeFormatter.print(_)),
        "isPageSkin" -> lineItem.isPageSkin,
        "sponsor" -> lineItem.sponsor,
        "status" -> lineItem.status,
        "costType" -> lineItem.costType,
        "creativePlaceholders" -> lineItem.creativePlaceholders,
        "targeting" -> lineItem.targeting,
        "lastModified" -> timeFormatter.print(lineItem.lastModified),
      )
    }
  }

  implicit val lineItemReads: Reads[GuLineItem] = (
    (JsPath \ "id").read[Long] and
      (JsPath \ "orderId").read[Long] and
      (JsPath \ "name").read[String] and
      (JsPath \ "lineItemType").read[GuLineItemType] and
      (JsPath \ "startTime").read[String].map(timeFormatter.parseDateTime) and
      (JsPath \ "endTime").readNullable[String].map(_.map(timeFormatter.parseDateTime)) and
      (JsPath \ "isPageSkin").read[Boolean] and
      (JsPath \ "sponsor").readNullable[String] and
      (JsPath \ "status").read[String] and
      (JsPath \ "costType").read[String] and
      (JsPath \ "creativePlaceholders").read[Seq[GuCreativePlaceholder]] and
      (JsPath \ "targeting").read[GuTargeting] and
      (JsPath \ "lastModified").read[String].map(timeFormatter.parseDateTime)
  )(GuLineItem.apply _)

  def asMap(lineItems: Seq[GuLineItem]): Map[Long, GuLineItem] = lineItems.map(item => item.id -> item).toMap
}

case class GuCreativePlaceholder(size: AdSize, targeting: Option[GuTargeting]) {

  def targetsSectionFrontDirectly(sectionId: String): Boolean = {
    targeting.exists(_.targetsSectionFrontDirectly("business"))
  }
}

object GuCreativePlaceholder {

  implicit val guCreativePlaceholderFormats: Format[GuCreativePlaceholder] = Json.format[GuCreativePlaceholder]
}

case class GuCreativeTemplateParameter(
    parameterType: String,
    label: String,
    isRequired: Boolean,
    description: Option[String],
)

object GuCreativeTemplateParameter {

  implicit val GuCreativeTemplateParameterWrites = new Writes[GuCreativeTemplateParameter] {
    def writes(param: GuCreativeTemplateParameter): JsValue = {
      Json.obj(
        "type" -> param.parameterType,
        "label" -> param.label,
        "isRequired" -> param.isRequired,
        "description" -> param.description,
      )
    }
  }

  implicit val GuCreativeTemplateParameterReads: Reads[GuCreativeTemplateParameter] = (
    (JsPath \ "type").read[String] and
      (JsPath \ "label").read[String] and
      (JsPath \ "isRequired").read[Boolean] and
      (JsPath \ "description").readNullable[String]
  )(GuCreativeTemplateParameter.apply _)
}

case class GuCreative(
    id: Long,
    name: String,
    lastModified: DateTime,
    args: Map[String, String],
    templateId: Option[Long],
    snippet: Option[String],
    previewUrl: Option[String],
)

object GuCreative {

  def lastModified(cs: Seq[GuCreative]): Option[DateTime] = {
    if (cs.isEmpty) None
    else Some(cs.map(_.lastModified).maxBy(_.getMillis))
  }

  def merge(old: Seq[GuCreative], recent: Seq[GuCreative]): Seq[GuCreative] = {
    def mapById(cs: Seq[GuCreative]): Map[Long, GuCreative] = cs.map(c => c.id -> c).toMap
    (mapById(old) ++ mapById(recent)).values.toSeq
  }

  implicit val dateToTimestampWrites = play.api.libs.json.JodaWrites.JodaDateTimeNumberWrites
  implicit val guCreativeFormats: Format[GuCreative] = Json.format[GuCreative]
}

case class GuCreativeTemplate(
    id: Long,
    name: String,
    description: String,
    parameters: Seq[GuCreativeTemplateParameter],
    snippet: String,
    isNative: Boolean,
    creatives: Seq[GuCreative],
) {

  lazy val examplePreviewUrl: Option[String] = creatives flatMap { _.previewUrl } headOption

  lazy val isForApps: Boolean = name.startsWith("apps - ") || name.startsWith("as ") || name.startsWith("qc ")
}

object GuCreativeTemplate {

  implicit val guCreativeTemplateFormats: Format[GuCreativeTemplate] = Json.format[GuCreativeTemplate]
}

case class GuAdvertiser(
    id: Long,
    name: String,
)

case class GuOrder(
    id: Long,
    name: String,
    advertiserId: Long,
)

case class LineItemReport(timestamp: String, lineItems: Seq[GuLineItem], invalidLineItems: Seq[GuLineItem]) {

  lazy val (adTestLineItems, nonAdTestLineItems) = lineItems partition {
    _.targeting.hasAdTestTargetting
  }
}

object LineItemReport {

  implicit val lineItemReportFormats: Format[LineItemReport] = Json.format[LineItemReport]

}
