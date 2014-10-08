package dfp

import java.net.URLEncoder

import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import play.api.libs.json.{JsValue, Json, Writes}

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

  val targetsAdTest = isPositive("at")

  val isKeywordTag = isPositive("k")
  val isSeriesTag = isPositive("se")
  val isContributorTag = isPositive("co")

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

  val targetsAdTest = targets.exists(_.targetsAdTest)

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

}


case class GeoTarget(id: Long, parentId: Option[Int], locationType: String, name: String)

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

}


case class GuTargeting(adUnits: Seq[GuAdUnit], geoTargetsIncluded: Seq[GeoTarget], geoTargetsExcluded: Seq[GeoTarget], customTargetSets: Seq[CustomTargetSet]) {

  def hasAdTestTargetting = customTargetSets.exists(_.targetsAdTest)

  def targetsR2Only = customTargetSets exists (_.targetsR2Only)
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

}


case class GuLineItem(id: Long,
                      name: String,
                      startTime: DateTime,
                      endTime: Option[DateTime],
                      isPageSkin: Boolean,
                      sponsor: Option[String],
                      targeting: GuTargeting) {

  val isCurrent = startTime.isBeforeNow && (endTime.isEmpty || endTime.exists(_.isAfterNow))

  val sponsoredTags: Seq[String] = targeting.customTargetSets.flatMap(_.sponsoredTags).distinct

  val advertisementFeatureTags: Seq[String] = targeting.customTargetSets.flatMap(_.advertisementFeatureTags).distinct

  val foundationSupportedTags: Seq[String] = targeting.customTargetSets.flatMap(_.foundationSupportedTags).distinct

  val inlineMerchandisingTargetedKeywords: Seq[String] = targeting.customTargetSets.flatMap(_.inlineMerchandisingTargetedKeywords).distinct
  val inlineMerchandisingTargetedSeries: Seq[String] = targeting.customTargetSets.flatMap(_.inlineMerchandisingTargetedSeries).distinct
  val inlineMerchandisingTargetedContributors: Seq[String] = targeting.customTargetSets.flatMap(_.inlineMerchandisingTargetedContributors).distinct
}

object GuLineItem {

  implicit val lineItemWrites = new Writes[GuLineItem] {
    def writes(lineItem: GuLineItem): JsValue = {
      val timePattern = DateTimeFormat.forPattern("dd-MMM-YYYY HH:mm z")
      Json.obj(
        "id" -> lineItem.id,
        "name" -> lineItem.name,
        "startTime" -> timePattern.print(lineItem.startTime),
        "endTime" -> lineItem.endTime.map(endTime => timePattern.print(endTime)),
        "isPageSkin" -> lineItem.isPageSkin,
        "sponsor" -> lineItem.sponsor,
        "targeting" -> lineItem.targeting
      )
    }
  }

}


case class GuCreativeTemplateParameter(parameterType: String, label: String, isRequired: Boolean, description: String)

case class GuCreative(id: Long, name: String, args: Map[String, String])

case class GuCreativeTemplate(id: Long,
                              name: String,
                              description: String,
                              parameters: Seq[GuCreativeTemplateParameter],
                              snippet: String,
                              creatives: Seq[GuCreative]) {

  val example: Option[String] = creatives.headOption map { creative =>

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

}
