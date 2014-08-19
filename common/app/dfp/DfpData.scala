package dfp

import org.joda.time.DateTime

case class CustomTarget(name: String, op: String, values: Seq[String]) {

  def isPositive(targetName: String) = name == targetName && op == "IS"

  def isSlot(value: String) = isPositive("slot") && values.contains(value)

  val isSponsoredSlot = isSlot("spbadge")

  val isAdvertisementFeatureSlot = isSlot("adbadge")
  
  val isInlineMerchandisingSlot = isSlot("im")

  val targetsAdTest = isPositive("at")

  val isKeywordTag = isPositive("k")
  val isSeriesTag = isPositive("se")
  val isContributorTag = isPositive("co")
}


case class CustomTargetSet(op: String, targets: Seq[CustomTarget]) {
  def filterTags(tagCriteria: CustomTarget => Boolean)(bySlotType: CustomTarget => Boolean) = {
    if (targets exists bySlotType) {
      targets.filter(tagCriteria).flatMap(_.values).distinct
    } else Nil
  }

  val sponsoredTags = filterTags(tag => tag.isKeywordTag || tag.isSeriesTag)(_.isSponsoredSlot)

  val advertisementFeatureTags = filterTags(tag => tag.isKeywordTag || tag.isSeriesTag)(_.isAdvertisementFeatureSlot)

  val inlineMerchandisingTargetedKeywords = filterTags(tag => tag.isKeywordTag)(_.isInlineMerchandisingSlot)
  val inlineMerchandisingTargetedSeries = filterTags(tag => tag.isSeriesTag)(_.isInlineMerchandisingSlot)
  val inlineMerchandisingTargetedContributors = filterTags(tag => tag.isContributorTag)(_.isInlineMerchandisingSlot)

  val targetsAdTest = targets.exists(_.targetsAdTest)
}


case class GeoTarget(id: Long, parentId: Option[Int], locationType: String, name: String)


case class GuAdUnit(id: String, path: Seq[String])


case class GuTargeting(adUnits: Seq[GuAdUnit], geoTargets: Seq[GeoTarget], customTargetSets: Seq[CustomTargetSet]) {
  def hasAdTestTargetting = {
    customTargetSets.exists(_.targetsAdTest)
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

  val inlineMerchandisingTargetedKeywords: Seq[String] = targeting.customTargetSets.flatMap(_.inlineMerchandisingTargetedKeywords).distinct
  val inlineMerchandisingTargetedSeries: Seq[String] = targeting.customTargetSets.flatMap(_.inlineMerchandisingTargetedSeries).distinct
  val inlineMerchandisingTargetedContributors: Seq[String] = targeting.customTargetSets.flatMap(_.inlineMerchandisingTargetedContributors).distinct
}
