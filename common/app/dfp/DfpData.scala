package dfp

import org.joda.time.DateTime

case class CustomTarget(name: String, op: String, values: Seq[String]) {

  def isPositive(targetName: String) = name == targetName && op == "IS"

  def isSlot(value: String) = isPositive("slot") && values.contains(value)

  val isSponsoredSlot = isSlot("spbadge")

  val isAdvertisementFeatureSlot = isSlot("adbadge")
  
  val isInlineMerchandisingSlot = isSlot("im")

  val targetsAdTest = isPositive("at")

  val isTag = isPositive("k") || isPositive("se")
}


case class CustomTargetSet(op: String, targets: Seq[CustomTarget]) {
  def filterTags(bySlotType: CustomTarget => Boolean) = {
    if (targets exists bySlotType) {
      targets.filter(_.isTag).flatMap(_.values).distinct
    } else Nil
  }

  val sponsoredTags = filterTags(_.isSponsoredSlot)

  val advertisementFeatureTags = filterTags(_.isAdvertisementFeatureSlot)

  val targetsAdTest = targets.find(_.targetsAdTest).isDefined

  val inlineMerchandisingTargettedTags = filterTags(_.isInlineMerchandisingSlot)
}


case class GeoTarget(id: Long, parentId: Option[Int], locationType: String, name: String)


case class GuAdUnit(id: String, path: Seq[String])


case class GuTargeting(adUnits: Seq[GuAdUnit], geoTargets: Seq[GeoTarget], customTargetSets: Seq[CustomTargetSet]) {
  def hasAdTestTargetting = {
    customTargetSets.find(_.targetsAdTest).isDefined
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

  val inlineMerchandisingTargettedTags: Seq[String] = targeting.customTargetSets.flatMap(_.inlineMerchandisingTargettedTags).distinct
}
