package common.dfp

import java.net.URLEncoder

import common.Edition
import common.dfp.AdSize.{leaderboardSize, responsiveSize}
import org.joda.time.DateTime
import org.joda.time.DateTime.now
import org.joda.time.format.ISODateTimeFormat
import play.api.libs.functional.syntax._
import play.api.libs.json._

import scala.annotation.tailrec

case class CustomTarget(name: String, op: String, values: Seq[String]) {

  def isPositive(targetName: String) = name == targetName && op == "IS"
  def isNegative(targetName: String) = name == targetName && op == "IS_NOT"

  def isSlot(value: String) = isPositive("slot") && values.contains(value)

  def isPlatform(value: String) = isPositive("p") && values.contains(value)
  def isNotPlatform(value: String) = isNegative("p") && values.contains(value)

  val isSponsoredSlot = isSlot("spbadge")

  val isAdvertisementFeatureSlot = isSlot("adbadge")

  val isFoundationSupportedSlot = isSlot("fobadge")

  val isInlineMerchandisingSlot = isSlot("im")

  val isAdTest = isPositive("at")

  val isKeywordTag = isPositive("k")
  val isSeriesTag = isPositive("se")
  val isContributorTag = isPositive("co")
  val isEditionTag = isPositive("edition")

  val targetsR2Only: Boolean = isPlatform("r2") || isNotPlatform("ng")
}

object CustomTarget {

  implicit val customTargetWrites = new Writes[CustomTarget] {
    def writes(target: CustomTarget): JsValue = {
      Json.obj(
        "name" -> target.name,
        "op" -> target.op,
        "values" -> target.values
      )
    }
  }

  implicit val customTargetReads: Reads[CustomTarget] = (
    (JsPath \ "name").read[String] and
      (JsPath \ "op").read[String] and
      (JsPath \ "values").read[Seq[String]]
    )(CustomTarget.apply _)

}


case class CustomTargetSet(op: String, targets: Seq[CustomTarget]) {

  def filterTags(tagCriteria: CustomTarget => Boolean)(bySlotType: CustomTarget => Boolean) = {
    if (targets exists bySlotType) {
      targets.filter(tagCriteria).flatMap(_.values).distinct
    } else Nil
  }

  val sponsoredTags = filterTags(tag => tag.isKeywordTag || tag.isSeriesTag)(_.isSponsoredSlot)

  val advertisementFeatureTags = filterTags(tag => tag.isKeywordTag || tag.isSeriesTag)(_.isAdvertisementFeatureSlot)

  val foundationSupportedTags = filterTags(tag => tag.isKeywordTag || tag.isSeriesTag)(_.isFoundationSupportedSlot)

  val inlineMerchandisingTargetedKeywords = filterTags(tag => tag.isKeywordTag)(_.isInlineMerchandisingSlot)
  val inlineMerchandisingTargetedSeries = filterTags(tag => tag.isSeriesTag)(_.isInlineMerchandisingSlot)
  val inlineMerchandisingTargetedContributors = filterTags(tag => tag.isContributorTag)(_.isInlineMerchandisingSlot)

  val targetsR2Only: Boolean = targets exists (_.targetsR2Only)
}

object CustomTargetSet {

  implicit val customTargetSetWrites = new Writes[CustomTargetSet] {
    def writes(targetSet: CustomTargetSet): JsValue = {
      Json.obj(
        "op" -> targetSet.op,
        "targets" -> targetSet.targets
      )
    }
  }

  implicit val customTargetSetReads: Reads[CustomTargetSet] = (
    (JsPath \ "op").read[String] and
      (JsPath \ "targets").read[Seq[CustomTarget]]
    )(CustomTargetSet.apply _)

}


case class GeoTarget(id: Long, parentId: Option[Int], locationType: String, name: String) {

  private def targetsCountry(name: String) = locationType == "COUNTRY" && name == name

  lazy val targetsUk = targetsCountry("United Kingdom")

  lazy val targetsUs = targetsCountry("United States")

  lazy val targetsAustralia = targetsCountry("Australia")
}

object GeoTarget {

  implicit val geoTargetWrites = new Writes[GeoTarget] {
    def writes(geoTarget: GeoTarget): JsValue = {
      Json.obj(
        "id" -> geoTarget.id,
        "parentId" -> geoTarget.parentId,
        "locationType" -> geoTarget.locationType,
        "name" -> geoTarget.name
      )
    }
  }

  implicit val geoTargetReads: Reads[GeoTarget] = (
    (JsPath \ "id").read[Long] and
      (JsPath \ "parentId").readNullable[Int] and
      (JsPath \ "locationType").read[String] and
      (JsPath \ "name").read[String]
    )(GeoTarget.apply _)

}


case class GuAdUnit(id: String, path: Seq[String])

object GuAdUnit {

  implicit val adUnitWrites = new Writes[GuAdUnit] {
    def writes(adUnit: GuAdUnit): JsValue = {
      Json.obj(
        "id" -> adUnit.id,
        "path" -> adUnit.path
      )
    }
  }

  implicit val adUnitReads: Reads[GuAdUnit] = (
    (JsPath \ "id").read[String] and
      (JsPath \ "path").read[Seq[String]]
    )(GuAdUnit.apply _)

}


case class GuTargeting(adUnits: Seq[GuAdUnit],
                       geoTargetsIncluded: Seq[GeoTarget],
                       geoTargetsExcluded: Seq[GeoTarget],
                       customTargetSets: Seq[CustomTargetSet]) {

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

  val targetsR2Only: Boolean = customTargetSets exists (_.targetsR2Only)

  def targetsSectionFrontDirectly(sectionId: String): Boolean = {
    adUnits.exists { adUnit =>
      val path = adUnit.path
      path.length == 3 &&
        path(1) == sectionId &&
        path(2) == "front"
    }
  }
}

object GuTargeting {

  implicit val targetingWrites = new Writes[GuTargeting] {
    def writes(targeting: GuTargeting): JsValue = {
      Json.obj(
        "adUnits" -> targeting.adUnits,
        "geoTargetsIncluded" -> targeting.geoTargetsIncluded,
        "geoTargetsExcluded" -> targeting.geoTargetsExcluded,
        "customTargetSets" -> targeting.customTargetSets
      )
    }
  }

  implicit val targetingReads: Reads[GuTargeting] = (
    (JsPath \ "adUnits").read[Seq[GuAdUnit]] and
      (JsPath \ "geoTargetsIncluded").read[Seq[GeoTarget]] and
      (JsPath \ "geoTargetsExcluded").read[Seq[GeoTarget]] and
      (JsPath \ "customTargetSets").read[Seq[CustomTargetSet]]
    )(GuTargeting.apply _)

}


case class GuLineItem(id: Long,
                      name: String,
                      startTime: DateTime,
                      endTime: Option[DateTime],
                      isPageSkin: Boolean,
                      sponsor: Option[String],
                      status: String,
                      costType: String,
                      creativePlaceholders: Seq[GuCreativePlaceholder],
                      targeting: GuTargeting,
                      lastModified: DateTime) {

  val isCurrent = startTime.isBeforeNow && (endTime.isEmpty || endTime.exists(_.isAfterNow))
  val isExpired = endTime.exists(_.isBeforeNow)
  val isExpiredRecently = isExpired && endTime.exists(_.isAfter(now.minusWeeks(1)))
  val isExpiringSoon = !isExpired && endTime.exists(_.isBefore(now.plusMonths(1)))

  val paidForTags: Seq[String] = targeting.customTargetSets.flatMap { targetSet =>
    targetSet.sponsoredTags ++ targetSet.advertisementFeatureTags ++ targetSet.foundationSupportedTags
  }.distinct

  val sponsoredTags: Seq[String] = targeting.customTargetSets.flatMap(_.sponsoredTags).distinct

  val advertisementFeatureTags: Seq[String] = targeting.customTargetSets.flatMap(_.advertisementFeatureTags).distinct

  val foundationSupportedTags: Seq[String] = targeting.customTargetSets.flatMap(_.foundationSupportedTags).distinct

  val inlineMerchandisingTargetedKeywords: Seq[String] = targeting.customTargetSets.flatMap(_.inlineMerchandisingTargetedKeywords).distinct
  val inlineMerchandisingTargetedSeries: Seq[String] = targeting.customTargetSets.flatMap(_.inlineMerchandisingTargetedSeries).distinct
  val inlineMerchandisingTargetedContributors: Seq[String] = targeting.customTargetSets.flatMap(_.inlineMerchandisingTargetedContributors).distinct

  lazy val targetsNetworkOrSectionFrontDirectly: Boolean = {
    targeting.adUnits.exists { adUnit =>
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

  lazy val isSuitableForTopBelowNavSlot: Boolean = targeting.customTargetSets
                                                   .exists(_.targets.exists(_.isSlot("top-below-nav")))

  lazy val isSuitableForTopSlot: Boolean = {
    costType == "CPD" &&
    targetsNetworkOrSectionFrontDirectly &&
    targeting.geoTargetsIncluded.exists { geoTarget =>
      geoTarget.locationType == "COUNTRY" && (
        geoTarget.name == "United Kingdom" ||
        geoTarget.name == "United States" ||
        geoTarget.name == "Australia"
        )
    } &&
    creativeSizes.contains(responsiveSize) &&
    startTime.isBefore(DateTime.now.plusDays(1)) &&
    endTime.exists(_.isAfterNow)
  }

  lazy val creativeSizes = creativePlaceholders map (_.size)

  lazy val isAdFeatureLogo: Boolean = targeting.customTargetSets exists {
    _.targets exists (_.isAdvertisementFeatureSlot)
  }
}

object GuLineItem {

  private val timeFormatter = ISODateTimeFormat.dateTime().withZoneUTC()

  implicit val lineItemWrites = new Writes[GuLineItem] {
    def writes(lineItem: GuLineItem): JsValue = {
      Json.obj(
        "id" -> lineItem.id,
        "name" -> lineItem.name,
        "startTime" -> timeFormatter.print(lineItem.startTime),
        "endTime" -> lineItem.endTime.map(timeFormatter.print(_)),
        "isPageSkin" -> lineItem.isPageSkin,
        "sponsor" -> lineItem.sponsor,
        "status" -> lineItem.status,
        "costType" -> lineItem.costType,
        "creativePlaceholders" -> lineItem.creativePlaceholders,
        "targeting" -> lineItem.targeting,
        "lastModified" -> timeFormatter.print(lineItem.lastModified)
      )
    }
  }

  implicit val lineItemReads: Reads[GuLineItem] = (
    (JsPath \ "id").read[Long] and
      (JsPath \ "name").read[String] and
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
}


case class GuCreativePlaceholder(size: AdSize, targeting: Option[GuTargeting]) {

  def targetsSectionFrontDirectly(sectionId: String): Boolean = {
    targeting.exists(_.targetsSectionFrontDirectly("business"))
  }
}

object GuCreativePlaceholder {

  implicit val writes: Writes[GuCreativePlaceholder] = new Writes[GuCreativePlaceholder] {
    def writes(placeholder: GuCreativePlaceholder): JsValue = {
      Json.obj(
        "size" -> placeholder.size,
        "targeting" -> placeholder.targeting
      )
    }
  }

  implicit val reads: Reads[GuCreativePlaceholder] = (
    (JsPath \ "size").read[AdSize] and
      (JsPath \ "targeting").readNullable[GuTargeting]
    )(GuCreativePlaceholder.apply _)
}


case class GuCreativeTemplateParameter(parameterType: String,
                                       label: String,
                                       isRequired: Boolean,
                                       description: Option[String])

object GuCreativeTemplateParameter {

  implicit val writes = new Writes[GuCreativeTemplateParameter] {
    def writes(param: GuCreativeTemplateParameter): JsValue = {
      Json.obj(
        "type" -> param.parameterType,
        "label" -> param.label,
        "isRequired" -> param.isRequired,
        "description" -> param.description
      )
    }
  }

  implicit val reads: Reads[GuCreativeTemplateParameter] = (
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
  snippet: Option[String]
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

  implicit val writes = new Writes[GuCreative] {
    def writes(creative: GuCreative): JsValue = {
      Json.obj(
        "id" -> creative.id,
        "name" -> creative.name,
        "lastModified" -> creative.lastModified,
        "args" -> creative.args,
        "templateId" -> creative.templateId,
        "snippet" -> creative.snippet
      )
    }
  }

  implicit val reads: Reads[GuCreative] = (
    (JsPath \ "id").read[Long] and
      (JsPath \ "name").read[String] and
      (JsPath \ "lastModified").read[DateTime] and
      (JsPath \ "args").read[Map[String, String]] and
      (JsPath \ "templateId").readNullable[Long] and
      (JsPath \ "snippet").readNullable[String]
    ) (GuCreative.apply _)
}

case class GuCreativeTemplate(id: Long,
                              name: String,
                              description: String,
                              parameters: Seq[GuCreativeTemplateParameter],
                              snippet: String,
                              creatives: Seq[GuCreative]) {

  val example: Option[String] = creatives.headOption map { creative =>

    @tailrec
    def replaceParameters(html: String, args: Seq[(String, String)]): String = {
      if (args.isEmpty) html
      else {
        val (key, value) = args.head
        val encodedValue = URLEncoder.encode(value, "utf-8")
        replaceParameters(html.replace(s"[%$key%]", value).replace(s"[%URI_ENCODE:$key%]", encodedValue), args.tail)
      }
    }

    replaceParameters(snippet, creative.args.toSeq)
  }

  lazy val isForApps: Boolean = name.startsWith("apps - ") || name.startsWith("as ") || name.startsWith("qc ")
}

object GuCreativeTemplate extends implicits.Collections {

  implicit val writes = new Writes[GuCreativeTemplate] {
    def writes(template: GuCreativeTemplate): JsValue = {
      Json.obj(
        "id" -> template.id,
        "name" -> template.name,
        "description" -> template.description,
        "parameters" -> template.parameters,
        "snippet" -> template.snippet,
        "creatives" -> template.creatives
      )
    }
  }

  implicit val reads: Reads[GuCreativeTemplate] = (
    (JsPath \ "id").read[Long] and
      (JsPath \ "name").read[String] and
      (JsPath \ "description").read[String] and
      (JsPath \ "parameters").read[Seq[GuCreativeTemplateParameter]] and
      (JsPath \ "snippet").read[String] and
      (JsPath \ "creatives").read[Seq[GuCreative]]
    )(GuCreativeTemplate.apply _)
}

case class LineItemReport(timestamp: String, lineItems: Seq[GuLineItem]) {

  lazy val (adTestLineItems, nonAdTestLineItems) = lineItems partition {
    _.targeting.hasAdTestTargetting
  }
}

object LineItemReport {

  implicit val reportWrites = new Writes[LineItemReport] {
    def writes(report: LineItemReport): JsValue = {
      Json.obj(
        "timestamp" -> report.timestamp,
        "lineItems" -> report.lineItems
      )
    }
  }

  implicit val reportReads: Reads[LineItemReport] = (
    (JsPath \ "timestamp").read[String] and
      (JsPath \ "lineItems").read[Seq[GuLineItem]]
    )(LineItemReport.apply _)

}
